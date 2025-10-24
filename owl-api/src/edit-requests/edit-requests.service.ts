import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateEditRequestDto } from './dto/create-edit-request.dto';
import { UpdateEditRequestDto } from './dto/update-edit-request.dto';

@Injectable()
export class EditRequestsService {
  constructor(private prisma: PrismaService) {}

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
      // Apply project updates
      await this.prisma.project.update({
        where: { projectId },
        data: {
          projectTitle: requestedData.projectTitle,
          description: requestedData.description,
          playableUrl: requestedData.playableUrl,
          repoUrl: requestedData.repoUrl,
          screenshotUrl: requestedData.screenshotUrl,
        },
      });
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
    }
  }
}
