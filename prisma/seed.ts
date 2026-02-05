import { PrismaClient, UserRole, JobStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up database...');

  // Delete in reverse dependency order to respect foreign key constraints
  await prisma.application.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Database cleaned.');

  // ────────────────────────────────────────────────
  // Create employer account
  // ────────────────────────────────────────────────
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
      // Optional: you can also add phone, avatarUrl, etc. later
    },
  });

  console.log('Employer created:', {
    id: employer.id,
    email: employer.email,
    role: employer.role,
  });

  // ────────────────────────────────────────────────
  // Create admin account
  // ────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@khmerwork.com' },
    update: {
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
    create: {
      email: 'admin@khmerwork.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      bio: 'Platform administrator.',
      location: 'Phnom Penh, Cambodia',
    },
  });

  console.log('Admin created:', {
    id: admin.id,
    email: admin.email,
    role: admin.role,
  });

  // ────────────────────────────────────────────────
  // Create sample jobs
  // ────────────────────────────────────────────────
  const job1 = await prisma.job.create({
    data: {
      title: 'Senior Frontend Developer',
      description:
        'We are looking for a React expert to build and maintain our Next.js frontend.',
      category: 'Software Engineering',
      skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
      budget: 3500,
      budgetType: 'FIXED',
      status: JobStatus.OPEN,
      location: 'Phnom Penh (Remote)',
      responsibilities: [
        'Develop and maintain high-quality React components using Next.js App Router',
        'Implement responsive, accessible designs with Tailwind CSS',
        'Collaborate with backend engineers to integrate APIs',
        'Write unit/integration tests with Jest + React Testing Library',
        'Optimize web applications for maximum speed and scalability',
        'Participate in code reviews and help improve frontend architecture',
      ],
      requirements: [
        '3+ years of professional experience with React and modern frontend stacks',
        'Strong proficiency in TypeScript and Next.js (App Router preferred)',
        'Expert knowledge of Tailwind CSS and component-based styling',
        'Experience integrating RESTful and/or GraphQL APIs',
        'Familiarity with testing (Jest, RTL, Playwright/Cypress is a plus)',
        'Good understanding of Git and modern CI/CD workflows',
      ],
      posterId: employer.id,
    },
  });

  const job2 = await prisma.job.create({
    data: {
      title: 'UI/UX Designer (Glassmorphism & Motion Design)',
      description:
        'Create beautiful, modern glassmorphic interfaces with smooth micro-interactions for our SaaS platform.',
      category: 'Creative & Design',
      skills: ['Figma', 'UI/UX', 'Glassmorphism', 'Motion Design', 'Framer Motion'],
      budget: 50,
      budgetType: 'HOURLY',
      status: JobStatus.OPEN,
      location: 'Remote (Worldwide)',
      responsibilities: [
        'Design modern, glassmorphic user interfaces and design systems',
        'Create high-fidelity prototypes and interactive mockups in Figma',
        'Design smooth micro-interactions and page transitions',
        'Work closely with frontend developers to ensure pixel-perfect implementation',
        'Produce design assets, icons, illustrations when needed',
        'Participate in user testing and iterate based on feedback',
      ],
      requirements: [
        '3+ years of UI/UX design experience, preferably in SaaS/web applications',
        'Strong portfolio showcasing glassmorphism, neumorphism or modern UI trends',
        'Advanced proficiency in Figma (auto-layout, components, variables)',
        'Experience with motion design tools (After Effects, Principle, Framer Motion)',
        'Good understanding of design systems and atomic design principles',
        'Ability to deliver responsive designs for web + mobile',
      ],
      posterId: employer.id,
    },
  });

  console.log('Jobs created:', {
    job1: { id: job1.id, title: job1.title, budget: job1.budget },
    job2: { id: job2.id, title: job2.title, budget: job2.budget },
  });
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });