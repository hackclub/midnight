import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateEditRequestDto } from './dto/create-edit-request.dto';
import { UpdateEditRequestDto } from './dto/update-edit-request.dto';
import { AirtableService } from '../airtable/airtable.service';

@Injectable()
export class EditRequestsService {
  constructor(
    private prisma: PrismaService,
    private airtableService: AirtableService,
  ) {}

  async createEditRequest(createEditRequestDto: CreateEditRequestDto, userId: number) {
    const { projectId, requestType, currentData, requestedData, reason } = createEditRequestDto;

    // Verify project exists and belongs to user
    const project = await this.prisma.project.findUnique({
      where: { projectId },
      include: { user: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Check if project is locked
    if (project.isLocked) {
      throw new BadRequestException('Project is locked. Cannot create edit requests for locked projects.');
    }

    // Create the edit request
    const editRequest = await this.prisma.editRequest.create({
      data: {
        userId,
        projectId,
        requestType,
        currentData,
        requestedData,
        reason,
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

    return editRequest;
  }

  async getEditRequests(userId: number) {
    const editRequests = await this.prisma.editRequest.findMany({
      where: { userId },
      include: {
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
      orderBy: { createdAt: 'desc' },
    });

    return editRequests;
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
      orderBy: { createdAt: 'desc' },
    });

    return editRequests;
  }

  async updateEditRequest(requestId: number, updateEditRequestDto: UpdateEditRequestDto, adminUserId: number) {
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

    const { status, reason } = updateEditRequestDto;

    // If approving, apply the changes
    if (status === 'approved') {
      await this.applyEditRequest(editRequest);
    }

    const updatedRequest = await this.prisma.editRequest.update({
      where: { requestId },
      data: {
        status,
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

    return updatedRequest;
  }

  private async applyEditRequest(editRequest: any) {
    const { requestType, requestedData, projectId } = editRequest;

    if (requestType === 'project_update') {
      // Get project with user data for Airtable sync
      const project = await this.prisma.project.findUnique({
        where: { projectId },
        include: {
          user: true,
        },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      // Apply project updates
      const updatedProject = await this.prisma.project.update({
        where: { projectId },
        data: {
          projectTitle: requestedData.projectTitle,
          description: requestedData.description,
          playableUrl: requestedData.playableUrl,
          repoUrl: requestedData.repoUrl,
          screenshotUrl: requestedData.screenshotUrl,
        },
      });

      // Sync changes to Airtable if record exists
      if (project.airtableRecId) {
        try {
          const airtableData = {
            user: {
              firstName: project.user.firstName,
              lastName: project.user.lastName,
              email: project.user.email,
              birthday: project.user.birthday,
              addressLine1: project.user.addressLine1,
              addressLine2: project.user.addressLine2,
              city: project.user.city,
              state: project.user.state,
              country: project.user.country,
              zipCode: project.user.zipCode,
            },
            project: {
              projectTitle: updatedProject.projectTitle,
              description: updatedProject.description,
              playableUrl: updatedProject.playableUrl,
              repoUrl: updatedProject.repoUrl,
              screenshotUrl: updatedProject.screenshotUrl,
              nowHackatimeHours: updatedProject.nowHackatimeHours,
            },
            submission: {
              description: updatedProject.description,
              playableUrl: updatedProject.playableUrl,
              repoUrl: updatedProject.repoUrl,
              screenshotUrl: updatedProject.screenshotUrl,
            },
          };

          // Update the existing Airtable record
          await this.airtableService.updateYSWSSubmission(project.airtableRecId, {
            // Map project fields to Airtable fields
            approvedHours: updatedProject.approvedHours,
            hoursJustification: updatedProject.hoursJustification,
          });

          // Update Airtable record with new project data
          await fetch(
            `https://api.airtable.com/v0/${this.airtableService['BASE_ID']}/${this.airtableService['YSWS_TABLE_ID']}/${project.airtableRecId}`,
            {
              method: 'PATCH',
              headers: {
                Authorization: `Bearer ${process.env.USER_SERVICE_AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                fields: {
                  'Code URL': updatedProject.repoUrl,
                  'Playable URL': updatedProject.playableUrl,
                  'Description': updatedProject.description,
                  'Screenshot': updatedProject.screenshotUrl ? [
                    {
                      url: updatedProject.screenshotUrl,
                      filename: `screenshot-${Date.now()}.png`
                    }
                  ] : undefined,
                },
              }),
            },
          );
        } catch (error) {
          console.error('Error syncing project changes to Airtable:', error);
          // Don't throw error here to avoid breaking the edit request approval
        }
      }
    } else if (requestType === 'user_update') {
      // Apply user updates
      await this.prisma.user.update({
        where: { userId: editRequest.userId },
        data: {
          firstName: requestedData.firstName,
          lastName: requestedData.lastName,
          birthday: requestedData.birthday ? new Date(requestedData.birthday) : undefined,
          addressLine1: requestedData.addressLine1,
          addressLine2: requestedData.addressLine2,
          city: requestedData.city,
          state: requestedData.state,
          country: requestedData.country,
          zipCode: requestedData.zipCode,
        },
      });

      // Sync user changes to Airtable if record exists
      const user = await this.prisma.user.findUnique({
        where: { userId: editRequest.userId },
      });

      if (user?.airtableRecId) {
        try {
          await fetch(
            `https://api.airtable.com/v0/${this.airtableService['BASE_ID']}/${this.airtableService['YSWS_TABLE_ID']}/${user.airtableRecId}`,
            {
              method: 'PATCH',
              headers: {
                Authorization: `Bearer ${process.env.USER_SERVICE_AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                fields: {
                  'First Name': requestedData.firstName,
                  'Last Name': requestedData.lastName,
                  'Birthday': requestedData.birthday ? new Date(requestedData.birthday).toISOString().split('T')[0] : undefined,
                  'Address (Line 1)': requestedData.addressLine1,
                  'Address (Line 2)': requestedData.addressLine2 || '',
                  'City': requestedData.city,
                  'State / Province': requestedData.state,
                  'Country': requestedData.country,
                  'ZIP / Postal Code': requestedData.zipCode,
                },
              }),
            },
          );
        } catch (error) {
          console.error('Error syncing user changes to Airtable:', error);
          // Don't throw error here to avoid breaking the edit request approval
        }
      }
    }
  }
}
