import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async create(data: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: { ...data, password: hashedPassword },
      select: this.userSelect,
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        ...this.userSelect,
        reviews: true,
        jobsPosted: true,
      },
    });
  }

  private get userSelect() {
    return {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      avatar: true,
      bio: true,
      headline: true,
      website: true,
      github: true,
      linkedin: true,
      location: true,
      skills: true,
      hourlyRate: true,
      languages: true,
      education: true,
      experience: true,
      resumeUrl: true,
      resumeTemplate: true,
      verified: true,
      createdAt: true,
    };
  }

  async update(id: string, data: UpdateUserDto) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return this.prisma.user.update({
      where: { id },
      data,
      select: this.userSelect
    });
  }
}