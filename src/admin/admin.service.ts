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
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        const [
            totalUsers,
            totalJobs,
            totalApplications,
            totalPayments,
            newUsersThisMonth,
            newJobsThisMonth,
            newApplicationsThisMonth,
            paymentsByStatus,
            reviewsCount
        ] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.job.count(),
            this.prisma.application.count(),
            this.prisma.payment.aggregate({
                _sum: { amount: true },
            }),
            this.prisma.user.count({ where: { createdAt: { gte: lastMonth } } }),
            this.prisma.job.count({ where: { createdAt: { gte: lastMonth } } }),
            this.prisma.application.count({ where: { createdAt: { gte: lastMonth } } }),
            this.prisma.payment.groupBy({
                by: ['status'],
                _count: true,
                _sum: { amount: true }
            }),
            this.prisma.review.count()
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

        const revenue = totalPayments._sum.amount || 0;

        return {
            overview: {
                totalUsers,
                totalJobs,
                totalApplications,
                revenue,
                reviewsCount,
                growth: {
                    users: newUsersThisMonth,
                    jobs: newJobsThisMonth,
                    applications: newApplicationsThisMonth
                }
            },
            jobsByStatus,
            paymentsByStatus,
            recentUsers,
        };
    }

    async getAllUsers(page = 1, limit = 10, search?: string) {
        const skip = (page - 1) * limit;
        const where = search ? {
            OR: [
                { email: { contains: search, mode: 'insensitive' as const } },
                { firstName: { contains: search, mode: 'insensitive' as const } },
                { lastName: { contains: search, mode: 'insensitive' as const } },
            ]
        } : {};

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { jobsPosted: true, applications: true },
                    },
                },
            }),
            this.prisma.user.count({ where }),
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

    async getAllJobs(page = 1, limit = 10, search?: string) {
        const skip = (page - 1) * limit;
        const where = search ? {
            OR: [
                { title: { contains: search, mode: 'insensitive' as const } },
                { description: { contains: search, mode: 'insensitive' as const } },
                { companyName: { contains: search, mode: 'insensitive' as const } },
            ]
        } : {};

        const [jobs, total] = await Promise.all([
            this.prisma.job.findMany({
                where,
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
            this.prisma.job.count({ where }),
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

    async getAllApplications(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [applications, total] = await Promise.all([
            this.prisma.application.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    applicant: {
                        select: { firstName: true, lastName: true, email: true },
                    },
                    job: {
                        select: { title: true, companyName: true },
                    },
                },
            }),
            this.prisma.application.count(),
        ]);

        return {
            data: applications,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
            },
        };
    }

    async updateApplicationStatus(applicationId: string, status: ApplicationStatus) {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: { job: true }
        });
        if (!application) throw new NotFoundException('Application not found');

        const updatedApplication = await this.prisma.application.update({
            where: { id: applicationId },
            data: { status },
        });

        await this.notificationsService.create(application.applicantId, {
            message: `Your application for "${application.job.title}" has been updated to ${status}.`,
            type: 'JOB'
        });

        return updatedApplication;
    }

    async getAllPayments(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [payments, total] = await Promise.all([
            this.prisma.payment.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { firstName: true, lastName: true, email: true },
                    },
                },
            }),
            this.prisma.payment.count(),
        ]);

        return {
            data: payments,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
            },
        };
    }

    async getAllReviews(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [reviews, total] = await Promise.all([
            this.prisma.review.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    reviewer: { select: { firstName: true, lastName: true } },
                    reviewee: { select: { firstName: true, lastName: true } },
                },
            }),
            this.prisma.review.count(),
        ]);

        return {
            data: reviews,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
            },
        };
    }

    async deleteReview(reviewId: string) {
        return this.prisma.review.delete({ where: { id: reviewId } });
    }

    async deleteUser(userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        return this.prisma.user.delete({ where: { id: userId } });
    }

    async cleanupTestData() {
        const testEmailPattern = '@test.com';

        const testUsers = await this.prisma.user.findMany({
            where: { email: { contains: testEmailPattern } },
            select: { id: true, email: true }
        });

        const userIds = testUsers.map(u => u.id);
        console.log(`Found ${userIds.length} test users to cleanup:`, testUsers.map(u => u.email));

        if (userIds.length === 0) {
            const orphanedJobs = await this.prisma.job.findMany({
                where: {
                    OR: [
                        { title: { contains: 'Full-Feature Job' } },
                        { companyName: { contains: 'AutoTest Corp' } }
                    ]
                },
                select: { id: true }
            });

            if (orphanedJobs.length > 0) {
                const jobIds = orphanedJobs.map(j => j.id);
                await this.prisma.application.deleteMany({ where: { jobId: { in: jobIds } } });
                await this.prisma.job.deleteMany({ where: { id: { in: jobIds } } });
                return { deletedCount: jobIds.length, message: `Removed ${jobIds.length} orphaned test jobs.` };
            }
            return { deletedCount: 0, message: 'No test data found' };
        }

        // 1. Delete Reviews (Link to Users)
        await this.prisma.review.deleteMany({
            where: { OR: [{ reviewerId: { in: userIds } }, { revieweeId: { in: userIds } }] }
        });

        // 2. Delete Messages (Link to Users)
        await this.prisma.message.deleteMany({
            where: { OR: [{ senderId: { in: userIds } }, { receiverId: { in: userIds } }] }
        });

        // 3. Find and Delete Jobs + their Applications
        const jobs = await this.prisma.job.findMany({
            where: { posterId: { in: userIds } },
            select: { id: true }
        });
        const jobIds = jobs.map(j => j.id);
        if (jobIds.length > 0) {
            await this.prisma.application.deleteMany({ where: { jobId: { in: jobIds } } });
            await this.prisma.job.deleteMany({ where: { id: { in: jobIds } } });
        }

        // 4. Delete other user-linked data
        await this.prisma.notification.deleteMany({ where: { userId: { in: userIds } } });
        await this.prisma.payment.deleteMany({ where: { userId: { in: userIds } } });
        await this.prisma.application.deleteMany({ where: { applicantId: { in: userIds } } });

        // 5. Finally delete the users
        const deleted = await this.prisma.user.deleteMany({
            where: { id: { in: userIds } }
        });

        return {
            deletedCount: deleted.count,
            message: `Successfully removed ${deleted.count} test users and their associated data.`
        };
    }
}
