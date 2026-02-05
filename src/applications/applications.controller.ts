import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':jobId')
  @ApiOperation({ summary: 'Apply for a job' })
  apply(@Param('jobId') jobId: string, @Body() data: CreateApplicationDto, @Request() req) {
    return this.applicationsService.apply(req.user.id, jobId, data);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('job/:jobId')
  @ApiOperation({ summary: 'Get all applications for a specific job' })
  getForJob(@Param('jobId') jobId: string, @Request() req) {
    return this.applicationsService.getForJob(jobId, req.user.id);
  }
}