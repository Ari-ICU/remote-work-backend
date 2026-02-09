import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class EmployerResourcesService implements OnModuleInit {
    constructor(private prisma: PrismaService) { }

    async onModuleInit() {
        await this.seedInitialData();
    }

    async getCategories() {
        return this.prisma.employerResourceCategory.findMany({
            orderBy: { order: 'asc' },
        });
    }

    async getGuides() {
        return this.prisma.employerFeaturedGuide.findMany({
            orderBy: { order: 'asc' },
        });
    }

    async getDownloads() {
        return this.prisma.employerDownloadableResource.findMany({
            orderBy: { order: 'asc' },
        });
    }

    async getFaqs() {
        return this.prisma.employerFAQ.findMany({
            orderBy: { order: 'asc' },
        });
    }

    // Admin methods - Categories
    async createCategory(data: any) {
        return this.prisma.employerResourceCategory.create({ data });
    }

    async updateCategory(id: string, data: any) {
        return this.prisma.employerResourceCategory.update({
            where: { id },
            data,
        });
    }

    async deleteCategory(id: string) {
        return this.prisma.employerResourceCategory.delete({ where: { id } });
    }

    // Admin methods - Guides
    async createGuide(data: any) {
        return this.prisma.employerFeaturedGuide.create({ data });
    }

    async updateGuide(id: string, data: any) {
        return this.prisma.employerFeaturedGuide.update({
            where: { id },
            data,
        });
    }

    async deleteGuide(id: string) {
        return this.prisma.employerFeaturedGuide.delete({ where: { id } });
    }

    // Admin methods - Downloads
    async createDownload(data: any) {
        return this.prisma.employerDownloadableResource.create({ data });
    }

    async updateDownload(id: string, data: any) {
        return this.prisma.employerDownloadableResource.update({
            where: { id },
            data,
        });
    }

    async deleteDownload(id: string) {
        return this.prisma.employerDownloadableResource.delete({ where: { id } });
    }

    // Admin methods - FAQs
    async createFaq(data: any) {
        return this.prisma.employerFAQ.create({ data });
    }

    async updateFaq(id: string, data: any) {
        return this.prisma.employerFAQ.update({
            where: { id },
            data,
        });
    }

    async deleteFaq(id: string) {
        return this.prisma.employerFAQ.delete({ where: { id } });
    }

    private async seedInitialData() {
        const categoryCount = await this.prisma.employerResourceCategory.count();
        if (categoryCount === 0) {
            const categories = [
                {
                    icon: "BookOpen",
                    title: "Hiring Guides",
                    description: "Comprehensive guides to help you hire the best remote talent",
                    color: "text-blue-500",
                    bg: "bg-blue-500/10",
                    resources: [
                        "Complete Guide to Remote Hiring in Cambodia",
                        "How to Write Effective Job Descriptions",
                        "Best Practices for Interviewing Remote Candidates",
                        "Onboarding Remote Employees Successfully"
                    ],
                    order: 1
                },
                {
                    icon: "Video",
                    title: "Video Tutorials",
                    description: "Step-by-step video guides for using our platform effectively",
                    color: "text-purple-500",
                    bg: "bg-purple-500/10",
                    resources: [
                        "Getting Started with KhmerWork",
                        "How to Post Your First Job",
                        "Managing Applications Efficiently",
                        "Using Our Messaging System"
                    ],
                    order: 2
                },
                {
                    icon: "FileText",
                    title: "Templates & Tools",
                    description: "Ready-to-use templates and tools to streamline your hiring",
                    color: "text-green-500",
                    bg: "bg-green-500/10",
                    resources: [
                        "Job Description Templates",
                        "Interview Question Bank",
                        "Candidate Evaluation Scorecards",
                        "Offer Letter Templates"
                    ],
                    order: 3
                },
                {
                    icon: "TrendingUp",
                    title: "Market Insights",
                    description: "Data-driven insights about the Cambodian job market",
                    color: "text-orange-500",
                    bg: "bg-orange-500/10",
                    resources: [
                        "2026 Salary Benchmarking Report",
                        "Remote Work Trends in Cambodia",
                        "Skills in Demand Analysis",
                        "Hiring Competition Insights"
                    ],
                    order: 4
                }
            ];
            for (const cat of categories) {
                await this.prisma.employerResourceCategory.create({ data: cat });
            }
        }

        const guideCount = await this.prisma.employerFeaturedGuide.count();
        if (guideCount === 0) {
            const guides = [
                {
                    title: "The Ultimate Guide to Remote Hiring",
                    description: "Learn everything you need to know about building and managing a successful remote team in Cambodia.",
                    category: "Hiring Strategy",
                    readTime: "15 min read",
                    icon: "Users",
                    color: "bg-blue-500",
                    order: 1
                },
                {
                    title: "Crafting Job Posts That Attract Top Talent",
                    description: "Discover the secrets to writing compelling job descriptions that stand out and attract qualified candidates.",
                    category: "Job Posting",
                    readTime: "8 min read",
                    icon: "Target",
                    color: "bg-green-500",
                    order: 2
                },
                {
                    title: "Effective Remote Interview Techniques",
                    description: "Master the art of conducting virtual interviews that help you identify the best candidates for your team.",
                    category: "Interviewing",
                    readTime: "12 min read",
                    icon: "Video",
                    color: "bg-purple-500",
                    order: 3
                },
                {
                    title: "Building a Strong Employer Brand",
                    description: "Learn how to position your company as an employer of choice in the competitive Cambodian market.",
                    category: "Branding",
                    readTime: "10 min read",
                    icon: "Lightbulb",
                    color: "bg-orange-500",
                    order: 4
                }
            ];
            for (const guide of guides) {
                await this.prisma.employerFeaturedGuide.create({ data: guide });
            }
        }

        const downloadCount = await this.prisma.employerDownloadableResource.count();
        if (downloadCount === 0) {
            const downloads = [
                {
                    title: "Hiring Checklist",
                    description: "A comprehensive checklist to ensure you don't miss any crucial steps in your hiring process.",
                    format: "PDF",
                    size: "2.4 MB",
                    order: 1
                },
                {
                    title: "Interview Question Templates",
                    description: "Pre-written interview questions for various roles and experience levels.",
                    format: "DOCX",
                    size: "1.8 MB",
                    order: 2
                },
                {
                    title: "Salary Benchmarking Guide",
                    description: "Detailed salary data for remote positions across different industries in Cambodia.",
                    format: "PDF",
                    size: "3.2 MB",
                    order: 3
                },
                {
                    title: "Remote Work Policy Template",
                    description: "A customizable template for creating your company's remote work policy.",
                    format: "DOCX",
                    size: "1.5 MB",
                    order: 4
                }
            ];
            for (const download of downloads) {
                await this.prisma.employerDownloadableResource.create({ data: download });
            }
        }

        const faqCount = await this.prisma.employerFAQ.count();
        if (faqCount === 0) {
            const faqs = [
                {
                    question: "How do I attract quality candidates to my job postings?",
                    answer: "Focus on writing clear, detailed job descriptions that highlight your company culture, benefits, and growth opportunities. Use relevant keywords, be transparent about salary ranges, and respond quickly to applications.",
                    order: 1
                },
                {
                    question: "What's the average time to hire on KhmerWork?",
                    answer: "Most employers find qualified candidates within 7-14 days. The timeline depends on factors like job complexity, salary range, and how quickly you review applications. Premium listings typically see faster results.",
                    order: 2
                },
                {
                    question: "How can I verify candidate skills and experience?",
                    answer: "We recommend a multi-step verification process: review portfolios, conduct technical assessments, check references, and use video interviews. Our platform also provides skill verification badges for candidates.",
                    order: 3
                },
                {
                    question: "What payment methods do you accept?",
                    answer: "We accept major credit cards (Visa, Mastercard), PayPal, and local payment methods including KHQR. All transactions are secure and processed through encrypted payment gateways.",
                    order: 4
                }
            ];
            for (const faq of faqs) {
                await this.prisma.employerFAQ.create({ data: faq });
            }
        }
    }
}
