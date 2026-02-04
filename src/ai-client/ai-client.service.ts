import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AiClientService {
  constructor(private prisma: PrismaService) {}

  // Mock implementation for AI matching logic
  async calculateJobMatch(jobId: string, applicantId: string): Promise<number> {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    const user = await this.prisma.user.findUnique({ where: { id: applicantId } });

    // logic to compare user.skills vs job.skills
    const matchingSkills = user.skills.filter(skill => job.skills.includes(skill));
    const score = (matchingSkills.length / job.skills.length) * 100;

    await this.prisma.application.update({
      where: { jobId_applicantId: { jobId, applicantId } },
      data: { aiMatchScore: score },
    });

    return score;
  }
}