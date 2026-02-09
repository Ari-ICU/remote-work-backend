import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class SalaryGuideService {
    constructor(private prisma: PrismaService) { }

    async getSalaryData() {
        const categories = await this.prisma.salaryCategory.findMany({
            include: {
                roles: true,
            },
            orderBy: {
                order: 'asc',
            },
        });

        const insights = await this.prisma.salaryInsight.findMany({
            orderBy: {
                order: 'asc',
            },
        });

        return {
            categories,
            insights,
        };
    }

    // Admin methods
    async createCategory(data: { name: string; order?: number }) {
        return this.prisma.salaryCategory.create({
            data,
        });
    }

    async updateCategory(id: string, data: { name?: string; order?: number }) {
        return this.prisma.salaryCategory.update({
            where: { id },
            data,
        });
    }

    async deleteCategory(id: string) {
        return this.prisma.salaryCategory.delete({
            where: { id },
        });
    }

    async createRole(data: {
        title: string;
        range: string;
        experience: string;
        categoryId: string;
    }) {
        return this.prisma.salaryRole.create({
            data,
        });
    }

    async updateRole(
        id: string,
        data: { title?: string; range?: string; experience?: string },
    ) {
        return this.prisma.salaryRole.update({
            where: { id },
            data,
        });
    }

    async deleteRole(id: string) {
        return this.prisma.salaryRole.delete({
            where: { id },
        });
    }

    async createInsight(data: {
        icon: string;
        title: string;
        description: string;
        color: string;
        bg: string;
        order?: number;
    }) {
        return this.prisma.salaryInsight.create({
            data,
        });
    }

    async updateInsight(
        id: string,
        data: {
            icon?: string;
            title?: string;
            description?: string;
            color?: string;
            bg?: string;
            order?: number;
        },
    ) {
        return this.prisma.salaryInsight.update({
            where: { id },
            data,
        });
    }

    async deleteInsight(id: string) {
        return this.prisma.salaryInsight.delete({
            where: { id },
        });
    }
}
