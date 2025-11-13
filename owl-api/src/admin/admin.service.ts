import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { AirtableService } from '../airtable/airtable.service';

const projectAdminInclude = {
  user: {
    select: {
      userId: true,
      firstName: true,
      lastName: true,
      email: true,
      birthday: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      state: true,
      country: true,
      zipCode: true,
      hackatimeAccount: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  submissions: {
    orderBy: { createdAt: 'desc' },
  },
} as const;

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private airtableService: AirtableService,
  ) {}

  async getAllSubmissions() {
    const submissions = await this.prisma.submission.findMany({
      include: {
        project: {
          include: {
            user: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
                email: true,
                birthday: true,
                addressLine1: true,
                addressLine2: true,
                city: true,
                state: true,
                country: true,
                zipCode: true,
                airtableRecId: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return submissions;
  }

  async updateSubmission(submissionId: number, updateSubmissionDto: UpdateSubmissionDto, adminUserId: number) {
    const submission = await this.prisma.submission.findUnique({
      where: { submissionId },
      include: {
        project: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const updateData: any = {};

    if (updateSubmissionDto.approvedHours !== undefined) {
      updateData.approvedHours = updateSubmissionDto.approvedHours;
    }
    if (updateSubmissionDto.hoursJustification !== undefined) {
      updateData.hoursJustification = updateSubmissionDto.hoursJustification;
    }
    if (updateSubmissionDto.approvalStatus !== undefined) {
      updateData.approvalStatus = updateSubmissionDto.approvalStatus;
      updateData.reviewedBy = adminUserId.toString();
      updateData.reviewedAt = new Date();
    }

    const updatedSubmission = await this.prisma.submission.update({
      where: { submissionId },
      data: updateData,
      include: {
        project: {
          include: {
            user: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // If submission is approved, create Airtable record
    if (updateSubmissionDto.approvalStatus === 'approved' && !submission.project.airtableRecId) {
      try {
        const airtableData = {
          user: {
            firstName: submission.project.user.firstName,
            lastName: submission.project.user.lastName,
            email: submission.project.user.email,
            birthday: submission.project.user.birthday,
            addressLine1: submission.project.user.addressLine1,
            addressLine2: submission.project.user.addressLine2,
            city: submission.project.user.city,
            state: submission.project.user.state,
            country: submission.project.user.country,
            zipCode: submission.project.user.zipCode,
          },
          project: {
            projectTitle: submission.project.projectTitle,
            description: submission.project.description,
            playableUrl: submission.project.playableUrl,
            repoUrl: submission.project.repoUrl,
            screenshotUrl: submission.project.screenshotUrl,
            nowHackatimeHours: submission.project.nowHackatimeHours,
            nowHackatimeProjects: submission.project.nowHackatimeProjects,
          },
          submission: {
            description: submission.description,
            playableUrl: submission.playableUrl,
            repoUrl: submission.repoUrl,
            screenshotUrl: submission.screenshotUrl,
          },
        };

        const airtableResult = await this.airtableService.createYSWSSubmission(airtableData);
        
        // Update project with Airtable record ID
        await this.prisma.project.update({
          where: { projectId: submission.projectId },
          data: { airtableRecId: airtableResult.recordId },
        });

        // Update user with Airtable record ID if not already set
        if (!submission.project.user.airtableRecId) {
          await this.prisma.user.update({
            where: { userId: submission.project.userId },
            data: { airtableRecId: airtableResult.recordId },
          });
        }

        // Update Airtable record with approved hours if provided
        if (updateSubmissionDto.approvedHours !== undefined) {
          await this.airtableService.updateYSWSSubmission(airtableResult.recordId, {
            approvedHours: updateSubmissionDto.approvedHours,
            hoursJustification: updateSubmissionDto.hoursJustification,
          });
        }
      } catch (error) {
        console.error('Error creating Airtable record:', error);
        // Don't throw error here to avoid breaking the submission update
      }
    }

    return updatedSubmission;
  }

  async getAllEditRequests() {
    const editRequests = await this.prisma.editRequest.findMany({
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
            birthday: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            state: true,
            country: true,
            zipCode: true,
            airtableRecId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        project: {
          select: {
            projectId: true,
            projectTitle: true,
            projectType: true,
            description: true,
            playableUrl: true,
            repoUrl: true,
            screenshotUrl: true,
            nowHackatimeHours: true,
            nowHackatimeProjects: true,
            airtableRecId: true,
            isLocked: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        reviewer: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return editRequests;
  }

  async unlockProject(projectId: number, adminUserId: number) {
    const project = await this.prisma.project.findUnique({
      where: { projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const updatedProject = await this.prisma.project.update({
      where: { projectId },
      data: {
        isLocked: false,
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
        submissions: true,
      },
    });

    return updatedProject;
  }

  async approveEditRequest(requestId: number, adminUserId: number) {
    const editRequest = await this.prisma.editRequest.findUnique({
      where: { requestId },
      include: {
        project: true,
        user: true,
      },
    });

    if (!editRequest) {
      throw new NotFoundException('Edit request not found');
    }

    if (editRequest.status !== 'pending') {
      throw new ForbiddenException('Edit request has already been processed');
    }

    // Calculate hackatime hours if hackatime projects are being updated
    let calculatedHours = editRequest.project.nowHackatimeHours;
    if ((editRequest.requestedData as any).nowHackatimeProjects) {
      // For now, we'll set a placeholder value. In a real implementation,
      // you would fetch hours from the hackatime API based on project names
      calculatedHours = ((editRequest.requestedData as any).nowHackatimeProjects as string[]).length * 10; // Placeholder calculation
    }

    // Update the project with the requested data
    const updateData: any = {};
    if ((editRequest.requestedData as any).projectTitle !== undefined) {
      updateData.projectTitle = (editRequest.requestedData as any).projectTitle;
    }
    if ((editRequest.requestedData as any).description !== undefined) {
      updateData.description = (editRequest.requestedData as any).description;
    }
    if ((editRequest.requestedData as any).playableUrl !== undefined) {
      updateData.playableUrl = (editRequest.requestedData as any).playableUrl;
    }
    if ((editRequest.requestedData as any).repoUrl !== undefined) {
      updateData.repoUrl = (editRequest.requestedData as any).repoUrl;
    }
    if ((editRequest.requestedData as any).screenshotUrl !== undefined) {
      updateData.screenshotUrl = (editRequest.requestedData as any).screenshotUrl;
    }
    if ((editRequest.requestedData as any).airtableRecId !== undefined) {
      updateData.airtableRecId = (editRequest.requestedData as any).airtableRecId;
    }
    if ((editRequest.requestedData as any).nowHackatimeProjects !== undefined) {
      updateData.nowHackatimeProjects = (editRequest.requestedData as any).nowHackatimeProjects;
      updateData.nowHackatimeHours = calculatedHours;
    }

    // Update the project
    const updatedProject = await this.prisma.project.update({
      where: { projectId: editRequest.projectId },
      data: updateData,
    });

    // Update the edit request status
    const updatedEditRequest = await this.prisma.editRequest.update({
      where: { requestId },
      data: {
        status: 'approved',
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
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
        reviewer: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return {
      message: 'Edit request approved successfully.',
      editRequest: updatedEditRequest,
      project: updatedProject,
    };
  }

  async rejectEditRequest(requestId: number, reason: string, adminUserId: number) {
    const editRequest = await this.prisma.editRequest.findUnique({
      where: { requestId },
    });

    if (!editRequest) {
      throw new NotFoundException('Edit request not found');
    }

    if (editRequest.status !== 'pending') {
      throw new ForbiddenException('Edit request has already been processed');
    }

    const updatedEditRequest = await this.prisma.editRequest.update({
      where: { requestId },
      data: {
        status: 'rejected',
        reason,
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
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
        reviewer: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return {
      message: 'Edit request rejected successfully.',
      editRequest: updatedEditRequest,
    };
  }

  async getAllProjects() {
    const projects = await this.prisma.project.findMany({
      include: projectAdminInclude,
      orderBy: { createdAt: 'desc' },
    });

    return projects;
  }

  async recalculateProjectHours(projectId: number, strict = true) {
    const project = await this.prisma.project.findUnique({
      where: { projectId },
      include: projectAdminInclude,
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const baseUrl = process.env.HACKATIME_ADMIN_API_URL || 'https://hackatime.hackclub.com/api/admin/v1';
    const apiKey = process.env.HACKATIME_API_KEY;

    const cache = new Map<string, Map<string, number>>();
    const result = await this.recalculateProjectInternal(project, {
      strict,
      cache,
      baseUrl,
      apiKey,
    });

    if (!result?.project) {
      throw new BadRequestException('Unable to recalculate project hours');
    }

    return result;
  }

  async recalculateAllProjects() {
    const projects = await this.prisma.project.findMany({
      include: projectAdminInclude,
    });

    const cache = new Map<string, Map<string, number>>();
    const baseUrl = process.env.HACKATIME_ADMIN_API_URL || 'https://hackatime.hackclub.com/api/admin/v1';
    const apiKey = process.env.HACKATIME_API_KEY;

    const updated: Array<{ projectId: number; nowHackatimeHours: number }> = [];
    const skipped: Array<{ projectId: number; reason: string }> = [];
    const errors: Array<{ projectId: number; message: string }> = [];

    for (const project of projects) {
      try {
        const result = await this.recalculateProjectInternal(project, {
          strict: false,
          cache,
          baseUrl,
          apiKey,
        });

        if (result?.project) {
          updated.push({
            projectId: result.project.projectId,
            nowHackatimeHours: result.project.nowHackatimeHours ?? 0,
          });
        } else if (result?.skipped) {
          skipped.push({
            projectId: project.projectId,
            reason: result.reason,
          });
        }
      } catch (error) {
        errors.push({
          projectId: project.projectId,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      processed: projects.length,
      updated: updated.length,
      skipped,
      errors,
    };
  }

  async getTotals() {
    const [hackatimeAggregate, approvedAggregate, totalUsers, totalProjects] = await Promise.all([
      this.prisma.project.aggregate({
        _sum: { nowHackatimeHours: true },
      }),
      this.prisma.submission.aggregate({
        where: { approvalStatus: 'approved' },
        _sum: { approvedHours: true },
      }),
      this.prisma.user.count(),
      this.prisma.project.count(),
    ]);

    return {
      totals: {
        totalHackatimeHours: hackatimeAggregate._sum.nowHackatimeHours ?? 0,
        totalApprovedHours: approvedAggregate._sum.approvedHours ?? 0,
        totalUsers,
        totalProjects,
      },
    };
  }

  async deleteProject(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { projectId },
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.prisma.project.delete({
      where: { projectId },
    });

    return { deleted: true, projectId };
  }

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      include: {
        projects: {
          include: {
            submissions: {
              orderBy: { createdAt: 'desc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  }

  private async recalculateProjectInternal(
    project: {
      projectId: number;
      nowHackatimeProjects: string[] | null;
      user: {
        userId: number;
        firstName: string | null;
        lastName: string | null;
        email: string;
        hackatimeAccount: string | null;
      };
    },
    options: {
      strict: boolean;
      cache: Map<string, Map<string, number>>;
      baseUrl: string;
      apiKey?: string;
    },
  ) {
    const { strict, cache, baseUrl, apiKey } = options;

    if (!project.user?.hackatimeAccount) {
      if (strict) {
        throw new BadRequestException('User has no hackatime account linked');
      }
      return { skipped: true as const, reason: 'missing_hackatime_account' as const };
    }

    const hackatimeProjects = project.nowHackatimeProjects || [];

    if (hackatimeProjects.length === 0) {
      const updated = await this.prisma.project.update({
        where: { projectId: project.projectId },
        data: { nowHackatimeHours: 0 },
        include: projectAdminInclude,
      });

      return { project: updated };
    }

    const cacheKey = project.user.hackatimeAccount;
    let projectsMap = cache.get(cacheKey);

    if (!projectsMap) {
      const data = await this.fetchHackatimeProjectsData(
        cacheKey,
        baseUrl,
        apiKey,
      );
      projectsMap = data.projectsMap;
      cache.set(cacheKey, projectsMap);
    }

    const recalculatedHours = await this.calculateHackatimeHours(
      hackatimeProjects,
      projectsMap,
      project.user.hackatimeAccount,
      baseUrl,
      apiKey,
    );

    const updatedProject = await this.prisma.project.update({
      where: { projectId: project.projectId },
      data: { nowHackatimeHours: recalculatedHours },
      include: projectAdminInclude,
    });

    return { project: updatedProject };
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
    const projectsMap = new Map<string, number>();

    const addProject = (entry: any) => {
      if (typeof entry === 'string') {
        if (!projectsMap.has(entry)) {
          projectsMap.set(entry, 0);
        }
        return;
      }

      const name = entry?.name || entry?.projectName;

      if (typeof name === 'string') {
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

    return { projectsMap };
  }

  private async fetchHackatimeProjectDurationsAfterDate(
    hackatimeAccount: string,
    projectNames: string[],
    baseUrl: string,
    apiKey?: string,
    cutoffDate: Date = new Date('2025-10-10T00:00:00Z'),
  ): Promise<Map<string, number>> {
    const startDate = cutoffDate.toISOString().split('T')[0];
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
}
