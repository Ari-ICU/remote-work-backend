import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateJobDto) {
    return this.prisma.job.create({
      data: { ...data, posterId: userId },
    });
  }

  async findAll() {
    return this.prisma.job.findMany({
      where: { status: 'OPEN' },
      include: { poster: { select: { firstName: true, lastName: true } } },
    });
  }
}