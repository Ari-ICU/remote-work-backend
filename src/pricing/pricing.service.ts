import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class PricingService {
    constructor(private prisma: PrismaService) { }

    async getAllPlans() {
        return this.prisma.pricingPlan.findMany({
            orderBy: { order: 'asc' },
        });
    }

    async getPlanById(id: string) {
        const plan = await this.prisma.pricingPlan.findUnique({
            where: { id },
        });
        if (!plan) throw new NotFoundException('Plan not found');
        return plan;
    }

    async createPlan(data: any) {
        return this.prisma.pricingPlan.create({
            data,
        });
    }

    async updatePlan(id: string, data: any) {
        return this.prisma.pricingPlan.update({
            where: { id },
            data,
        });
    }

    async deletePlan(id: string) {
        return this.prisma.pricingPlan.delete({
            where: { id },
        });
    }

    async seedInitialPlans() {
        const count = await this.prisma.pricingPlan.count();
        if (count > 0) return;

        const plans = [
            {
                name: "Free",
                price: 0,
                description: "Post your job and start receiving applications.",
                features: [
                    "1 Job Posting",
                    "Live for 30 days",
                    "Standard listing",
                    "Email support",
                    "Basic applicant management"
                ],
                highlight: false,
                cta: "Post for Free",
                href: "/post-job?plan=free",
                order: 1
            },
            {
                name: "Featured",
                price: 49,
                description: "Boost visibility and get more quality applicants.",
                features: [
                    "Everything in Free",
                    "Featured badge on listing",
                    "2x visibility in search results",
                    "Highlighted in job feed",
                    "Social media promotion",
                    "Priority support"
                ],
                highlight: true,
                cta: "Promote Your Job",
                href: "/checkout?plan=featured",
                badge: "Most Popular",
                order: 2
            },
            {
                name: "Premium",
                price: 99,
                description: "Maximum exposure for critical hires.",
                features: [
                    "Everything in Featured",
                    "Top of category placement",
                    "Homepage featured spot",
                    "Extended to 60 days",
                    "Custom company branding",
                    "Advanced analytics",
                    "Dedicated account manager"
                ],
                highlight: false,
                cta: "Get Premium",
                href: "/checkout?plan=premium",
                order: 3
            }
        ];

        for (const plan of plans) {
            await this.prisma.pricingPlan.create({ data: plan });
        }
    }
}
