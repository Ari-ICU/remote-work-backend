import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

import { CreateApplicationDto } from './dto/create-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) { }

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

    return this.prisma.application.create({
      data: {
        ...data,
        applicantId,
        jobId,
      },
    });
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
}