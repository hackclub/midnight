import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { AirtableService } from '../airtable/airtable.service';

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
}
