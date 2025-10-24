import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateSubmissionDto } from './dto/update-submission.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

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

    return updatedSubmission;
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
}
