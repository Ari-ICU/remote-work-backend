import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { AiClientService } from './ai-client.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsString, IsNotEmpty } from 'class-validator';
import { Throttle } from '@nestjs/throttler';


export class GenerateDescriptionDto {
    @ApiProperty({ example: 'React Native Developer', description: 'Job title' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'Mobile App Development', description: 'Job Category' })
    @IsString()
    @IsNotEmpty()
    category: string;
}

@ApiTags('ai')
@Controller('ai')
@Throttle({ default: { limit: 10, ttl: 60000 } })
export class AiClientController {
    constructor(private readonly aiService: AiClientService) { }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post('match/:jobId')
    @ApiOperation({ summary: 'Calculate AI Match Score for a job application' })
    async calculateMatch(@Param('jobId') jobId: string, @Request() req) {
        // In a real app, this might be triggered automatically or by admin.
        // Here we expose it for testing/demo.
        const score = await this.aiService.calculateJobMatch(jobId, req.user.id);
        return { score, jobId, applicantId: req.user.id };
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post('generate-description')
    @ApiOperation({ summary: 'Generate a job description using AI' })
    async generateDescription(@Body() dto: GenerateDescriptionDto) {
        return this.aiService.generateJobDescription({
            title: dto.title,
            industry: dto.category,
        });
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post('proposal')
    @ApiOperation({ summary: 'Generate a personalized cover letter' })
    async generateProposal(@Body() body: { job_title: string; job_description: string; user_skills: string[]; user_bio?: string }) {
        return this.aiService.generateProposal(body);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post('chat')
    @ApiOperation({ summary: 'Chat with the AI assistant' })
    async chat(@Body() body: { message: string }) {
        const reply = await this.aiService.chat(body.message);
        return { reply };
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post('predict-salary')
    @ApiOperation({ summary: 'Predict market salary based on skills and experience' })
    async predictSalary(@Body() body: { skills: string[]; experience_level: string; location?: string; job_type?: string }) {
        return this.aiService.predictSalary(body);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post('interview-questions')
    @ApiOperation({ summary: 'Generate tailored interview questions for an applicant' })
    async generateInterviewQuestions(@Body() body: { job_title: string; job_description: string; candidate_skills: string[]; candidate_bio?: string }) {
        return this.aiService.generateInterviewQuestions(body);
    }
}
