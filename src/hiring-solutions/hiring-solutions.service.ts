import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class HiringSolutionsService implements OnModuleInit {
    constructor(private prisma: PrismaService) { }

    async onModuleInit() {
        await this.seedInitialData();
    }

    async getSolutions() {
        return this.prisma.hiringSolution.findMany({
            orderBy: { order: 'asc' },
        });
    }

    async getStats() {
        return this.prisma.hiringStat.findMany({
            orderBy: { order: 'asc' },
        });
    }

    async getPlans() {
        return this.prisma.hiringPlan.findMany({
            orderBy: { order: 'asc' },
        });
    }

    // Admin methods
    async updateSolution(id: string, data: any) {
        return this.prisma.hiringSolution.update({
            where: { id },
            data,
        });
    }

    async createSolution(data: any) {
        return this.prisma.hiringSolution.create({
            data,
        });
    }

    async deleteSolution(id: string) {
        return this.prisma.hiringSolution.delete({
            where: { id },
        });
    }

    async updateStat(id: string, data: any) {
        return this.prisma.hiringStat.update({
            where: { id },
            data,
        });
    }

    async createStat(data: any) {
        return this.prisma.hiringStat.create({
            data,
        });
    }

    async deleteStat(id: string) {
        return this.prisma.hiringStat.delete({
            where: { id },
        });
    }

    async updatePlan(id: string, data: any) {
        return this.prisma.hiringPlan.update({
            where: { id },
            data,
        });
    }

    async createPlan(data: any) {
        return this.prisma.hiringPlan.create({
            data,
        });
    }

    async deletePlan(id: string) {
        return this.prisma.hiringPlan.delete({
            where: { id },
        });
    }

    private async seedInitialData() {
        const solutionCount = await this.prisma.hiringSolution.count();
        if (solutionCount === 0) {
            const solutions = [
                {
                    icon: "Target",
                    title: "Targeted Talent Matching",
                    description: "Our AI-powered algorithm matches you with the most qualified candidates based on your specific requirements, skills needed, and company culture.",
                    features: [
                        "Smart candidate recommendations",
                        "Skills-based matching",
                        "Cultural fit assessment",
                        "Automated screening"
                    ],
                    color: "text-blue-500",
                    bg: "bg-blue-500/10",
                    order: 1
                },
                {
                    icon: "Zap",
                    title: "Fast Hiring Process",
                    description: "Reduce your time-to-hire by up to 60% with our streamlined recruitment process and pre-vetted talent pool.",
                    features: [
                        "Pre-screened candidates",
                        "Quick application reviews",
                        "Instant messaging",
                        "Rapid onboarding"
                    ],
                    color: "text-yellow-500",
                    bg: "bg-yellow-500/10",
                    order: 2
                },
                {
                    icon: "Shield",
                    title: "Quality Assurance",
                    description: "Every candidate is thoroughly vetted to ensure they meet our high standards for skills, professionalism, and reliability.",
                    features: [
                        "Skill verification",
                        "Background checks",
                        "Portfolio reviews",
                        "Reference validation"
                    ],
                    color: "text-green-500",
                    bg: "bg-green-500/10",
                    order: 3
                },
                {
                    icon: "Users",
                    title: "Dedicated Support",
                    description: "Get personalized assistance from our hiring specialists who understand the Cambodian market and remote work dynamics.",
                    features: [
                        "Personal account manager",
                        "24/7 customer support",
                        "Hiring consultation",
                        "Onboarding assistance"
                    ],
                    color: "text-purple-500",
                    bg: "bg-purple-500/10",
                    order: 4
                },
            ];

            for (const sol of solutions) {
                await this.prisma.hiringSolution.create({ data: sol });
            }
        }

        const statCount = await this.prisma.hiringStat.count();
        if (statCount === 0) {
            const stats = [
                { label: "Active Employers", value: "2,500+", icon: "Users", order: 1 },
                { label: "Successful Hires", value: "15,000+", icon: "CheckCircle2", order: 2 },
                { label: "Average Time to Hire", value: "7 days", icon: "Clock", order: 3 },
                { label: "Satisfaction Rate", value: "94%", icon: "Award", order: 4 },
            ];

            for (const stat of stats) {
                await this.prisma.hiringStat.create({ data: stat });
            }
        }

        const planCount = await this.prisma.hiringPlan.count();
        if (planCount === 0) {
            const plans = [
                {
                    name: "Starter",
                    price: "$99",
                    period: "per job posting",
                    description: "Perfect for small businesses and startups",
                    features: [
                        "1 active job posting",
                        "30-day listing duration",
                        "Basic candidate matching",
                        "Email support",
                        "Standard job visibility",
                        "Application tracking"
                    ],
                    cta: "Get Started",
                    popular: false,
                    order: 1
                },
                {
                    name: "Professional",
                    price: "$249",
                    period: "per month",
                    description: "Ideal for growing companies with regular hiring needs",
                    features: [
                        "5 active job postings",
                        "60-day listing duration",
                        "Advanced AI matching",
                        "Priority support",
                        "Featured job listings",
                        "Candidate analytics",
                        "Custom branding",
                        "Interview scheduling tools"
                    ],
                    cta: "Start Free Trial",
                    popular: true,
                    order: 2
                },
                {
                    name: "Enterprise",
                    price: "Custom",
                    period: "contact us",
                    description: "For large organizations with extensive hiring requirements",
                    features: [
                        "Unlimited job postings",
                        "Extended listing duration",
                        "Dedicated account manager",
                        "24/7 priority support",
                        "Premium job placement",
                        "Advanced analytics dashboard",
                        "Custom integrations",
                        "Bulk hiring tools",
                        "White-label options",
                        "API access"
                    ],
                    cta: "Contact Sales",
                    popular: false,
                    order: 3
                },
            ];

            for (const plan of plans) {
                await this.prisma.hiringPlan.create({ data: plan });
            }
        }
    }
}
