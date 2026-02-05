import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { AiClientService } from './ai-client.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsString, IsNotEmpty } from 'class-validator';

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
        return {
            description: `[AI Generated] We are looking for a skilled ${dto.title} in the ${dto.category} field. Prerequisites include strong problem-solving skills and experience with modern tools...`,
            suggestedSkills: ['React', 'TypeScript', 'Node.js']
        };
    }

    @Post('chat')
    @ApiOperation({ summary: 'Chat with the AI assistant' })
    async chat(@Body() body: { message: string }) {
        const reply = await this.aiService.chat(body.message);
        return { reply };
    }
}
