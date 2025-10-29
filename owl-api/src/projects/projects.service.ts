import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateHackatimeProjectsDto } from './dto/update-hackatime-projects.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async createProject(createProjectDto: CreateProjectDto, userId: number) {
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

    return project;
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

    // Validate required project fields
    if (!project.projectTitle || !project.description || 
        project.nowHackatimeHours === null || project.nowHackatimeHours === undefined ||
        !project.playableUrl || !project.repoUrl || !project.screenshotUrl ||
        !project.nowHackatimeProjects || project.nowHackatimeProjects.length === 0) {
      throw new ForbiddenException('Project incomplete. Please complete all required project fields first.');
    }

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
      data: { isLocked: true },
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

    // Check if user has made at least one submission for this project
    if (project.submissions.length === 0) {
      throw new ForbiddenException('You must submit at least one submission before requesting project edits.');
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

    // Prepare requested data (only include fields that are being updated)
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
      requestedData.nowHackatimeHours = null; // Will be calculated by admin when approving
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

    const HACKATIME_ADMIN_API_URL = process.env.HACKATIME_ADMIN_API_URL || 'https://hackatime.hackclub.com/api/admin/v1';
    const HACKATIME_API_KEY = process.env.HACKATIME_API_KEY;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (HACKATIME_API_KEY) {
      headers['Authorization'] = `Bearer ${HACKATIME_API_KEY}`;
    }

    const res = await fetch(
      `${HACKATIME_ADMIN_API_URL}/user/projects?id=${project.user.hackatimeAccount}`,
      {
        method: 'GET',
        headers,
      },
    );

    if (!res.ok) {
      throw new BadRequestException('Failed to fetch hackatime projects for validation');
    }

    const hackatimeProjects = await res.json();
    const availableProjectNames = new Set<string>();

    if (Array.isArray(hackatimeProjects)) {
      hackatimeProjects.forEach((p: any) => {
        availableProjectNames.add(p.name || p.projectName || p);
      });
    } else if (hackatimeProjects.projects && Array.isArray(hackatimeProjects.projects)) {
      hackatimeProjects.projects.forEach((p: any) => {
        availableProjectNames.add(p.name || p.projectName || p);
      });
    } else if (hackatimeProjects.name || hackatimeProjects.projectName) {
      availableProjectNames.add(hackatimeProjects.name || hackatimeProjects.projectName);
    }

    for (const projectName of updateHackatimeProjectsDto.projectNames) {
      if (!availableProjectNames.has(projectName)) {
        throw new BadRequestException(`Project "${projectName}" is not a valid hackatime project`);
      }
    }

    const allLinkedProjects = await this.prisma.project.findMany({
      where: {
        userId: { not: userId },
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

      // Prepare requested data
      const requestedData = {
        nowHackatimeProjects: updateHackatimeProjectsDto.projectNames,
        nowHackatimeHours: null, // Will be calculated by admin when approving
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

    // Direct update if project is not locked
    const updatedProject = await this.prisma.project.update({
      where: { projectId },
      data: {
        nowHackatimeProjects: updateHackatimeProjectsDto.projectNames,
        nowHackatimeHours: null, // Will be calculated separately
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
}
