import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

import { CreateApplicationDto } from './dto/create-application.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) { }

  async apply(applicantId: string, jobId: string, data: CreateApplicationDto) {
    // Check if already applied
    const existing = await this.prisma.application.findUnique({
      where: {
        jobId_applicantId: { jobId, applicantId }
      }
    });

    if (existing) {
      throw new Error('You have already applied to this job');
    }

    const application = await this.prisma.application.create({
      data: {
        ...data,
        applicantId,
        jobId,
      },
      include: { job: true, applicant: true }
    });

    // Notify job poster
    await this.notificationsService.create(application.job.posterId, {
      message: `${application.applicant.firstName} ${application.applicant.lastName} just submitted an application for "${application.job.title}".`,
      type: 'JOB'
    });

    return application;
  }

  async getForJob(jobId: string, userId: string) {
    // Check if user is the job poster
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.posterId !== userId) {
      throw new Error('Access denied');
    }

    return this.prisma.application.findMany({
      where: { jobId },
      include: { applicant: { select: { firstName: true, lastName: true, bio: true, avatar: true } } },
      orderBy: { aiMatchScore: 'desc' }, // Order by AI score
    });
  }

  async getMyApplications(userId: string) {
    return this.prisma.application.findMany({
      where: { applicantId: userId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            status: true,
            // 'company' is not in Job model, using poster name instead
            poster: {
              select: { firstName: true, lastName: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}