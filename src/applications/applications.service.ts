import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async apply(applicantId: string, jobId: string, data: any) {
    return this.prisma.application.create({
      data: {
        ...data,
        applicantId,
        jobId,
      },
    });
  }

  async getForJob(jobId: string) {
    return this.prisma.application.findMany({
      where: { jobId },
      include: { applicant: { select: { firstName: true, lastName: true, bio: true } } },
      orderBy: { aiMatchScore: 'desc' }, // Order by AI score
    });
  }
}