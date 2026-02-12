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

  async generateProposal(data: { job_title: string; job_description: string; user_skills: string[]; user_bio?: string }) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/api/ai/generation/proposal`, data),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error generating proposal: ${error.message}`);
      throw error;
    }
  }

  async generateJobDescription(data: { title: string; industry: string; key_points?: string; experience_level?: string }) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/api/ai/generation/job-description`, data),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error generating job description: ${error.message}`);
      throw error;
    }
  }

  async predictSalary(data: { skills: string[]; experience_level: string; location?: string; job_type?: string }) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/api/ai/predictions/salary`, data),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error predicting salary: ${error.message}`);
      throw error;
    }
  }

  async generateInterviewQuestions(data: { job_title: string; job_description: string; candidate_skills: string[]; candidate_bio?: string }) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/api/ai/generation/interview-questions`, {
          job_title: data.job_title,
          job_description: data.job_description,
          candidate_skills: data.candidate_skills,
          candidate_bio: data.candidate_bio
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error generating interview questions: ${error.message}`);
      throw error;
    }
  }
}