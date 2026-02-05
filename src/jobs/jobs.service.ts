import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) { }

  async create(userId: string, data: CreateJobDto) {
    return this.prisma.job.create({
      data: { ...data, posterId: userId },
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
    if (!job || job.posterId !== userId) {
      throw new Error('Job not found or unauthorized');
    }

    return this.prisma.job.update({
      where: { id },
      data
    });
  }

  async remove(id: string, userId: string) {
    // Check ownership
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job || job.posterId !== userId) {
      throw new Error('Job not found or unauthorized');
    }

    return this.prisma.job.delete({
      where: { id }
    });
  }
}