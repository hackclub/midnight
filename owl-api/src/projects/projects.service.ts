import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateHackatimeProjectsDto } from './dto/update-hackatime-projects.dto';
import { RedisService } from '../redis.service';
import { randomBytes } from 'crypto';
import { PosthogService } from '../posthog/posthog.service';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private posthog: PosthogService,
  ) {}

  async createProject(createProjectDto: CreateProjectDto, userId: number) {
    const lockKey = `project-create-lock:${userId}`;
    const lockValue = randomBytes(16).toString('hex');
    const lockTTL = 10;

    const lockAcquired = await this.redis.acquireLock(lockKey, lockValue, lockTTL);
    
    if (!lockAcquired) {
      throw new BadRequestException('Project creation already in progress. Please wait a moment and try again.');
    }

    try {
      const existingProjectsCount = await this.prisma.project.count({
        where: { userId },
      });

      const project = await this.prisma.project.create({
        data: {
          userId,
          projectTitle: createProjectDto.projectTitle,
          projectType: createProjectDto.projectType,
          description: createProjectDto.projectDescription,
        },
        include: {
          user: {
            select: {
              userId: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      this.posthog.capture({
        distinctId: String(userId),
        event: 'project_created_backend',
        properties: {
          projectId: project.projectId,
          projectType: project.projectType,
        },
      });

      if (existingProjectsCount === 0) {
        await this.prisma.user.update({
          where: { userId },
          data: {
            onboardComplete: true,
            onboardedAt: new Date(),
          },
        });

        this.posthog.capture({
          distinctId: String(userId),
          event: 'onboarding_completed_backend',
          properties: {
            projectId: project.projectId,
          },
        });
      }

      return project;
    } finally {
      await this.redis.releaseLock(lockKey, lockValue);
    }
  }

  async getUserProjects(userId: number) {
    const projects = await this.prisma.project.findMany({
      where: { userId },
      include: {
        submissions: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects;
  }

  async getProject(projectId: number, userId: number) {
    const project = await this.prisma.project.findUnique({
      where: { projectId },
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
          },
        },
        submissions: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return project;
  }

  async createSubmission(createSubmissionDto: CreateSubmissionDto, userId: number) {
    const projectId = createSubmissionDto.projectId;
    
    // Get project with user data for validation
    const project = await this.prisma.project.findUnique({
      where: { projectId },
      include: {
        user: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Validate required user fields
    const user = project.user;
    if (!user.firstName || !user.lastName || !user.email || !user.birthday) {
      throw new ForbiddenException('User profile incomplete. Please complete your profile first.');
    }

    if (!user.addressLine1 || !user.city || !user.state || !user.country || !user.zipCode) {
      throw new ForbiddenException('User address incomplete. Please complete your address information first.');
    }

    if (this.calculateAge(user.birthday) >= 19) {
      throw new ForbiddenException('You must be under 19 to submit projects.');
    }

    if (!user.hackatimeAccount) {
      throw new BadRequestException('No Hackatime account linked to this user');
    }

    // Validate required project fields
    if (!project.projectTitle || !project.description || 
        project.nowHackatimeHours === null || project.nowHackatimeHours === undefined ||
        !project.playableUrl || !project.repoUrl || !project.screenshotUrl ||
        !project.nowHackatimeProjects || project.nowHackatimeProjects.length === 0) {
      throw new ForbiddenException('Project incomplete. Please complete all required project fields first.');
    }

    const hackatimeBaseUrl =
      process.env.HACKATIME_ADMIN_API_URL || 'https://hackatime.hackclub.com/api/admin/v1';
    const hackatimeApiKey = process.env.HACKATIME_API_KEY;
    const { projectsMap } = await this.fetchHackatimeProjectsData(
      user.hackatimeAccount,
      hackatimeBaseUrl,
      hackatimeApiKey,
    );
    const recalculatedHours = await this.calculateHackatimeHours(
      project.nowHackatimeProjects,
      projectsMap,
      user.hackatimeAccount,
      hackatimeBaseUrl,
      hackatimeApiKey,
    );

    // Copy data from project to submission (no manual input allowed)
    const submission = await this.prisma.submission.create({
      data: {
        projectId,
        playableUrl: project.playableUrl,
        screenshotUrl: project.screenshotUrl,
        description: project.description,
        repoUrl: project.repoUrl,
      },
    });

    // Lock the project after submission
    await this.prisma.project.update({
      where: { projectId },
      data: { isLocked: true, nowHackatimeHours: recalculatedHours },
    });

    this.posthog.capture({
      distinctId: String(userId),
      event: 'project_submitted_backend',
      properties: {
        projectId,
        projectType: project.projectType,
        submissionId: submission.submissionId,
      },
    });

    return submission;
  }

  async getProjectSubmissions(projectId: number, userId: number) {
    const project = await this.prisma.project.findUnique({
      where: { projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const submissions = await this.prisma.submission.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    return submissions;
  }

  async createEditRequest(projectId: number, updateProjectDto: UpdateProjectDto, userId: number) {
    const project = await this.prisma.project.findUnique({
      where: { projectId },
      include: {
        submissions: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (project.isLocked) {
      throw new ForbiddenException('Project is locked and cannot be edited. Contact an admin to unlock it.');
    }

    // Get current project data
    const currentData = {
      projectTitle: project.projectTitle,
      description: project.description,
      playableUrl: project.playableUrl,
      repoUrl: project.repoUrl,
      screenshotUrl: project.screenshotUrl,
      airtableRecId: project.airtableRecId,
      nowHackatimeProjects: project.nowHackatimeProjects,
      nowHackatimeHours: project.nowHackatimeHours,
    };

    const requestedData: any = {};
    if (updateProjectDto.projectTitle !== undefined) {
      requestedData.projectTitle = updateProjectDto.projectTitle;
    }
    if (updateProjectDto.description !== undefined) {
      requestedData.description = updateProjectDto.description;
    }
    if (updateProjectDto.playableUrl !== undefined) {
      requestedData.playableUrl = updateProjectDto.playableUrl;
    }
    if (updateProjectDto.repoUrl !== undefined) {
      requestedData.repoUrl = updateProjectDto.repoUrl;
    }
    if (updateProjectDto.screenshotUrl !== undefined) {
      requestedData.screenshotUrl = updateProjectDto.screenshotUrl;
    }
    if (updateProjectDto.airtableRecId !== undefined) {
      requestedData.airtableRecId = updateProjectDto.airtableRecId;
    }
    if (updateProjectDto.nowHackatimeProjects !== undefined) {
      requestedData.nowHackatimeProjects = updateProjectDto.nowHackatimeProjects;
      requestedData.nowHackatimeHours = null;
    }

    if (project.submissions.length === 0) {
      if (Object.keys(requestedData).length === 0) {
        return {
          message: 'No changes provided.',
          project,
        };
      }

      const updatedProject = await this.prisma.project.update({
        where: { projectId },
        data: requestedData,
      });

      return {
        message: 'Project updated successfully.',
        project: updatedProject,
      };
    }

    // Create edit request
    const editRequest = await this.prisma.editRequest.create({
      data: {
        userId,
        projectId,
        requestType: 'project_update',
        currentData,
        requestedData,
      },
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        project: {
          select: {
            projectId: true,
            projectTitle: true,
            projectType: true,
          },
        },
      },
    });

    return {
      message: 'Edit request created successfully. Waiting for admin approval.',
      editRequest,
    };
  }

  async updateHackatimeProjects(projectId: number, updateHackatimeProjectsDto: UpdateHackatimeProjectsDto, userId: number) {
    const project = await this.prisma.project.findUnique({
      where: { projectId },
      include: {
        submissions: true,
        user: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (!project.user.hackatimeAccount) {
      throw new BadRequestException('No Hackatime account linked to this user');
    }

    const hackatimeBaseUrl =
      process.env.HACKATIME_ADMIN_API_URL || 'https://hackatime.hackclub.com/api/admin/v1';
    const hackatimeApiKey = process.env.HACKATIME_API_KEY;
    const { availableProjectNames, projectsMap } = await this.fetchHackatimeProjectsData(
      project.user.hackatimeAccount,
      hackatimeBaseUrl,
      hackatimeApiKey,
    );

    for (const projectName of updateHackatimeProjectsDto.projectNames) {
      if (!availableProjectNames.has(projectName)) {
        throw new BadRequestException(`Project "${projectName}" is not a valid hackatime project`);
      }
    }

    const totalHours = await this.calculateHackatimeHours(
      updateHackatimeProjectsDto.projectNames,
      projectsMap,
      project.user.hackatimeAccount,
      hackatimeBaseUrl,
      hackatimeApiKey,
    );

    const allLinkedProjects = await this.prisma.project.findMany({
      where: {
        userId: userId,
        NOT: {
          projectId: { equals: projectId }
        }
      },
      select: {
        nowHackatimeProjects: true,
      },      
    });

    const linkedByOthers = new Set<string>();
    allLinkedProjects.forEach(p => {
      if (p.nowHackatimeProjects) {
        p.nowHackatimeProjects.forEach(name => linkedByOthers.add(name));
      }
    });

    const currentlyLinked = project.nowHackatimeProjects || [];
    const updatingToAlreadyLinked = updateHackatimeProjectsDto.projectNames.filter(
      name => linkedByOthers.has(name) && !currentlyLinked.includes(name)
    );

    if (updatingToAlreadyLinked.length > 0) {
      throw new BadRequestException(
        `Project(s) ${updatingToAlreadyLinked.join(', ')} are already linked to another project`
      );
    }

    // If project is locked (has submissions), create an edit request instead of direct update
    if (project.isLocked) {
      // Check if user has made at least one submission for this project
      if (project.submissions.length === 0) {
        throw new ForbiddenException('You must submit at least one submission before requesting project edits.');
      }

      // Get current project data
      const currentData = {
        nowHackatimeProjects: project.nowHackatimeProjects,
        nowHackatimeHours: project.nowHackatimeHours,
      };

      const requestedData = {
        nowHackatimeProjects: updateHackatimeProjectsDto.projectNames,
        nowHackatimeHours: totalHours,
      };

      // Create edit request
      const editRequest = await this.prisma.editRequest.create({
        data: {
          userId,
          projectId,
          requestType: 'project_update',
          currentData,
          requestedData,
        },
        include: {
          user: {
            select: {
              userId: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          project: {
            select: {
              projectId: true,
              projectTitle: true,
              projectType: true,
            },
          },
        },
      });

      return {
        message: 'Edit request created successfully. Waiting for admin approval.',
        editRequest,
      };
    }

    const updatedProject = await this.prisma.project.update({
      where: { projectId },
      data: {
        nowHackatimeProjects: updateHackatimeProjectsDto.projectNames,
        nowHackatimeHours: totalHours,
      },
    });

    return {
      message: 'Hackatime projects updated successfully.',
      project: updatedProject,
    };
  }

  async getHackatimeProjects(projectId: number, userId: number) {
    const project = await this.prisma.project.findUnique({
      where: { projectId },
      select: {
        projectId: true,
        nowHackatimeProjects: true,
        nowHackatimeHours: true,
        userId: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return {
      projectId: project.projectId,
      hackatimeProjects: project.nowHackatimeProjects,
      hackatimeHours: project.nowHackatimeHours,
    };
  }

  private async fetchHackatimeProjectsData(
    hackatimeAccount: string,
    baseUrl: string,
    apiKey?: string,
  ) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(`${baseUrl}/user/projects?id=${hackatimeAccount}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new BadRequestException('Failed to fetch hackatime projects');
    }

    const rawData = await response.json();
    const availableProjectNames = new Set<string>();
    const projectsMap = new Map<string, number>();

    const addProject = (entry: any) => {
      if (typeof entry === 'string') {
        availableProjectNames.add(entry);
        if (!projectsMap.has(entry)) {
          projectsMap.set(entry, 0);
        }
        return;
      }

      const name = entry?.name || entry?.projectName;

      if (typeof name === 'string') {
        availableProjectNames.add(name);
        const duration = typeof entry?.total_duration === 'number' ? entry.total_duration : 0;
        projectsMap.set(name, duration);
      }
    };

    if (Array.isArray(rawData)) {
      rawData.forEach(addProject);
    } else if (Array.isArray(rawData?.projects)) {
      rawData.projects.forEach(addProject);
    } else if (rawData?.name || rawData?.projectName) {
      addProject(rawData);
    }

    return { availableProjectNames, projectsMap };
  }

  private async fetchHackatimeProjectDurationsAfterDate(
    hackatimeAccount: string,
    projectNames: string[],
    baseUrl: string,
    apiKey?: string,
    cutoffDate: Date = new Date('2025-10-10T00:00:00Z'),
  ): Promise<Map<string, number>> {
    const startDate = cutoffDate.toISOString().split('T')[0];
    const hackatimeApiUrl = baseUrl.replace('/api/admin/v1', '/api/v1');
    const uri = `https://hackatime.hackclub.com/api/v1/users/${hackatimeAccount}/stats?features=projects&start_date=${startDate}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const durationsMap = new Map<string, number>();

    for (const projectName of projectNames) {
      durationsMap.set(projectName, 0);
    }

    try {
      const response = await fetch(uri, {
        method: 'GET',
        headers,
      });

      if (response.ok) {
        const responseData = await response.json();
        const projects = responseData?.data?.projects;
        
        if (projects && Array.isArray(projects)) {
          for (const project of projects) {
            const name = project?.name;
            if (typeof name === 'string' && projectNames.includes(name)) {
              const duration = typeof project?.total_seconds === 'number' 
                ? project.total_seconds 
                : 0;
              durationsMap.set(name, duration);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching hackatime stats:', error);
    }

    return durationsMap;
  }

  private async calculateHackatimeHours(
    projectNames: string[],
    projectsMap: Map<string, number>,
    hackatimeAccount?: string,
    baseUrl?: string,
    apiKey?: string,
  ) {
    if (hackatimeAccount && baseUrl) {
      const cutoffDate = new Date('2025-10-10T00:00:00Z');
      const filteredDurations = await this.fetchHackatimeProjectDurationsAfterDate(
        hackatimeAccount,
        projectNames,
        baseUrl,
        apiKey,
        cutoffDate,
      );

      let totalSeconds = 0;
      for (const name of projectNames) {
        totalSeconds += filteredDurations.get(name) || 0;
      }

      return Math.round((totalSeconds / 3600) * 10) / 10;
    }

    let totalSeconds = 0;
    for (const name of projectNames) {
      totalSeconds += projectsMap.get(name) || 0;
    }

    return Math.round((totalSeconds / 3600) * 10) / 10;
  }

  private calculateAge(birthday: Date) {
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const monthDiff = today.getMonth() - birthday.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
      age -= 1;
    }
    return age;
  }
}
