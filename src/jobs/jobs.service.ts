import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) { }

  async create(userId: string, data: CreateJobDto) {
    // Default to OPEN if status is not provided
    const jobStatus = (data.status as any) || 'OPEN';

    return this.prisma.job.create({
      data: {
        ...data,
        posterId: userId,
        status: jobStatus
      },
    });
  }

  async findAll() {
    return this.prisma.job.findMany({
      where: { status: 'OPEN' },
      include: {
        poster: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        _count: {
          select: { applications: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getCategories() {
    const categories = await this.prisma.job.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
      where: {
        status: 'OPEN',
      },
    });

    return categories.map((cat) => ({
      name: cat.category,
      count: cat._count.id,
    }));
  }

  async getFeaturedCompanies() {
    const employers = await this.prisma.user.findMany({
      where: {
        role: 'EMPLOYER',
        jobsPosted: {
          some: { status: 'OPEN' }
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        _count: {
          select: {
            jobsPosted: {
              where: { status: 'OPEN' }
            }
          }
        }
      },
      take: 6,
    });

    return employers.map(emp => ({
      id: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      jobsCount: emp._count.jobsPosted,
      logo: emp.firstName.substring(0, 1) + emp.lastName.substring(0, 1),
      avatar: emp.avatar
    }));
  }

  async findOne(id: string) {
    return this.prisma.job.findUnique({
      where: { id },
      include: {
        poster: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            bio: true,
            location: true,
            createdAt: true
          }
        },
        applications: {
          select: { id: true, status: true, applicantId: true }
        }
      }
    });
  }

  async update(id: string, data: UpdateJobDto, userId: string) {
    // Check ownership
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    if (job.posterId !== userId) {
      throw new ForbiddenException('You are not authorized to update this job');
    }

    const updateData: any = { ...data };

    return this.prisma.job.update({
      where: { id },
      data: updateData
    });
  }

  async remove(id: string, userId: string) {
    // Check ownership
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    if (job.posterId !== userId) {
      throw new ForbiddenException('You are not authorized to delete this job');
    }

    return this.prisma.job.delete({
      where: { id }
    });
  }

  async getMyJobs(userId: string) {
    return this.prisma.job.findMany({
      where: { posterId: userId },
      include: {
        _count: {
          select: { applications: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async hireFreelancer(jobId: string, freelancerId: string, employerId: string) {
    // Check ownership
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { applications: true }
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }
    if (job.posterId !== employerId) {
      throw new ForbiddenException('You are not authorized to hire for this job');
    }

    // Verify the freelancer has applied
    const application = job.applications.find(app => app.applicantId === freelancerId);
    if (!application) {
      throw new BadRequestException('Freelancer has not applied to this job');
    }

    // Update job status to IN_PROGRESS and mark freelancer as hired
    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'IN_PROGRESS',
        hiredFreelancerId: freelancerId
      }
    });
  }

  async completeJob(jobId: string, employerId: string) {
    // Check ownership
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    if (job.posterId !== employerId) {
      throw new ForbiddenException('You are not authorized to complete this job');
    }

    // Mark job as completed
    return this.prisma.job.update({
      where: { id: jobId },
      data: { status: 'COMPLETED' }
    });
  }
}