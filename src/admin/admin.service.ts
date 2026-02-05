import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { UserRole, JobStatus, ApplicationStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService
    ) { }

    async getStats() {
        const [totalUsers, totalJobs, totalApplications, totalPayments] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.job.count(),
            this.prisma.application.count(),
            this.prisma.payment.aggregate({
                _sum: {
                    amount: true,
                },
            }),
        ]);

        const jobsByStatus = await this.prisma.job.groupBy({
            by: ['status'],
            _count: true,
        });

        const recentUsers = await this.prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
            },
        });

        return {
            overview: {
                totalUsers,
                totalJobs,
                totalApplications,
                revenue: totalPayments._sum.amount || 0,
            },
            jobsByStatus,
            recentUsers,
        };
    }

    async getAllUsers(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { jobsPosted: true, applications: true },
                    },
                },
            }),
            this.prisma.user.count(),
        ]);

        return {
            data: users,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
            },
        };
    }

    async updateUserRole(userId: string, role: UserRole) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { role },
        });

        await this.notificationsService.create(userId, {
            message: `Your account role has been upgraded to ${role} by the System Administrator.`,
            type: 'SYSTEM'
        });

        return updatedUser;
    }

    async getAllJobs(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [jobs, total] = await Promise.all([
            this.prisma.job.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    poster: {
                        select: { firstName: true, lastName: true, email: true },
                    },
                    _count: {
                        select: { applications: true },
                    },
                },
            }),
            this.prisma.job.count(),
        ]);

        return {
            data: jobs,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
            },
        };
    }

    async updateJobStatus(jobId: string, status: JobStatus) {
        const job = await this.prisma.job.findUnique({ where: { id: jobId } });
        if (!job) throw new NotFoundException('Job not found');

        const updatedJob = await this.prisma.job.update({
            where: { id: jobId },
            data: { status },
        });

        await this.notificationsService.create(job.posterId, {
            message: `The mission "${job.title}" status has been modified to ${status}.`,
            type: 'JOB'
        });

        return updatedJob;
    }

    async deleteUser(userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        return this.prisma.user.delete({ where: { id: userId } });
    }
}
