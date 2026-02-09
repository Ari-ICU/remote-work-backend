import { Controller, Post, Get, Body, UseGuards, Request, Query, Param, Patch, Delete } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Post a new job' })
  create(@Body() createJobDto: CreateJobDto, @Request() req) {
    return this.jobsService.create(req.user.id, createJobDto);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get job categories with counts' })
  getCategories() {
    return this.jobsService.getCategories();
  }

  @Get('companies')
  @ApiOperation({ summary: 'Get featured companies with open job counts' })
  getFeaturedCompanies() {
    return this.jobsService.getFeaturedCompanies();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('my-jobs')
  @ApiOperation({ summary: 'List jobs posted by current user' })
  getMyJobs(@Request() req) {
    return this.jobsService.getMyJobs(req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all open jobs' })
  findAll() {
    return this.jobsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a job by ID' })
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update a job' })
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto, @Request() req) {
    return this.jobsService.update(id, updateJobDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a job' })
  remove(@Param('id') id: string, @Request() req) {
    return this.jobsService.remove(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/hire/:freelancerId')
  @ApiOperation({ summary: 'Hire a freelancer and close job to new applications' })
  hireFreelancer(@Param('id') id: string, @Param('freelancerId') freelancerId: string, @Request() req) {
    return this.jobsService.hireFreelancer(id, freelancerId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark job as completed' })
  completeJob(@Param('id') id: string, @Request() req) {
    return this.jobsService.completeJob(id, req.user.id);
  }
}