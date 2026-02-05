import { PrismaClient, UserRole, JobStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // Create an employer
    const hashedPassword = await bcrypt.hash('password123', 10);
    const employer = await prisma.user.upsert({
        where: { email: 'employer@example.com' },
        update: {},
        create: {
            email: 'employer@example.com',
            password: hashedPassword,
            firstName: 'John',
            lastName: 'Employer',
            role: UserRole.EMPLOYER,
            bio: 'We hire the best remote talent.',
            location: 'Phnom Penh, Cambodia',
        },
    });

    console.log({ employer });

    // Create some jobs
    const job1 = await prisma.job.create({
        data: {
            title: 'Senior Frontend Developer',
            description: 'We are looking for a React expert to build our Next.js frontend.',
            category: 'Software Engineering',
            skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
            budget: 3500,
            budgetType: 'FIXED',
            status: JobStatus.OPEN,
            location: 'Phnom Penh (Remote)',
            posterId: employer.id,
        },
    });

    const job2 = await prisma.job.create({
        data: {
            title: 'UI/UX Designer',
            description: 'Create beautiful glassmorphic designs for our platform.',
            category: 'Creative & Design',
            skills: ['Figma', 'UI/UX', 'Glassmorphism'],
            budget: 50,
            budgetType: 'HOURLY',
            status: JobStatus.OPEN,
            location: 'Remote',
            posterId: employer.id,
        },
    });

    console.log({ job1, job2 });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
