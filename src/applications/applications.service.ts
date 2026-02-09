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

    // Check if job is still open
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.status !== 'OPEN') {
      throw new Error('This job is no longer accepting applications');
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
            companyName: true,
            poster: {
              select: { firstName: true, lastName: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async acceptApplication(applicationId: string, employerId: string) {
    // Get application with job details
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true, applicant: true }
    });

    if (!application) {
      throw new Error('Application not found');
    }

    // Verify employer owns the job
    if (application.job.posterId !== employerId) {
      throw new Error('Access denied');
    }

    // Update application status to ACCEPTED
    const updatedApplication = await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: 'ACCEPTED' }
    });

    // Auto-close job by marking it as IN_PROGRESS and setting hired freelancer
    await this.prisma.job.update({
      where: { id: application.jobId },
      data: {
        status: 'IN_PROGRESS',
        hiredFreelancerId: application.applicantId
      }
    });

    // Notify the freelancer
    await this.notificationsService.create(application.applicantId, {
      message: `Congratulations! Your application for "${application.job.title}" has been accepted.`,
      type: 'JOB'
    });

    return updatedApplication;
  }

  async rejectApplication(applicationId: string, employerId: string) {
    // Get application with job details
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true }
    });

    if (!application) {
      throw new Error('Application not found');
    }

    // Verify employer owns the job
    if (application.job.posterId !== employerId) {
      throw new Error('Access denied');
    }

    // Update application status to REJECTED
    const updatedApplication = await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: 'REJECTED' }
    });

    // Notify the freelancer
    await this.notificationsService.create(application.applicantId, {
      message: `Your application for "${application.job.title}" was not selected this time.`,
      type: 'JOB'
    });

    return updatedApplication;
  }
}