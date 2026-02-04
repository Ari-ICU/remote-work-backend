import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':jobId')
  @ApiOperation({ summary: 'Apply for a job' })
  apply(@Param('jobId') jobId: string, @Body() data: any, @Request() req) {
    return this.applicationsService.apply(req.user.id, jobId, data);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('job/:jobId')
  @ApiOperation({ summary: 'Get all applications for a specific job' })
  getForJob(@Param('jobId') jobId: string) {
    return this.applicationsService.getForJob(jobId);
  }
}