import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiClientService {
  private readonly logger = new Logger(AiClientService.name);
  private readonly aiServiceUrl: string;

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.aiServiceUrl = this.configService.get('AI_SERVICE_URL') || 'http://ai-service:8000';
  }

  async calculateJobMatch(jobId: string, applicantId: string): Promise<number> {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    const user = await this.prisma.user.findUnique({ where: { id: applicantId } });

    if (!job || !user) return 0;

    // Construct text representation
    const jobDescription = `${job.title}\n${job.description}\nSkills: ${job.skills.join(', ')}`;
    const resumeText = `${user.bio || ''}\nSkills: ${user.skills.join(', ')}\nExperience: ${user.firstName} ${user.lastName}`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/api/ai/matching/similarity-score`, {
          job_description: jobDescription,
          resume_text: resumeText,
        }),
      );

      const score = response.data.similarity_score * 100; // Convert 0-1 to percentage

      await this.prisma.application.updateMany({
        where: { jobId, applicantId },
        data: { aiMatchScore: score },
      });

      return score;
    } catch (error) {
      this.logger.error(`Error connecting to AI service: ${error.message}`);
      // Fallback simple logic if AI service fails
      const matchingSkills = user.skills.filter(skill => job.skills.includes(skill));
      return (matchingSkills.length / job.skills.length) * 100;
    }
  }

  async chat(message: string): Promise<string> {
    try {
      this.logger.log(`Forwarding chat message to AI service: ${message}`);
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/api/ai/chat/`, {
          message: message,
        }),
      );

      return response.data.reply;
    } catch (error) {
      this.logger.error(`Error connecting to AI service chat: ${error.message}`);
      // Fallback response if AI service is down
      return "I'm having some trouble thinking right now. Please try again in a moment!";
    }
  }
}