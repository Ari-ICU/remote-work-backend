import { PrismaClient, UserRole, JobStatus, ApplicationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up database...');

  // Delete in reverse dependency order to respect foreign key constraints
  await prisma.notification.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Database cleaned.');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // ────────────────────────────────────────────────
  // Create Admin
  // ────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      email: 'admin@khmerwork.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      bio: 'Platform administrator ensuring smooth operations.',
      location: 'Phnom Penh, Cambodia',
      headline: 'Platform Master',
      verified: true,
    },
  });

  // ────────────────────────────────────────────────
  // Create Employers
  // ────────────────────────────────────────────────
  const employer1 = await prisma.user.create({
    data: {
      email: 'employer@example.com', // Primary test employer
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Employer',
      role: UserRole.EMPLOYER,
      bio: 'CEO of TechVanguard. We are always looking for top-tier freelancers to join our remote-first missions.',
      location: 'Singapore (Remote)',
      headline: 'Tech Entrepreneur & Visionary',
      website: 'https://techvanguard.io',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    },
  });

  const employer2 = await prisma.user.create({
    data: {
      email: 'sarah@designflow.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      role: UserRole.EMPLOYER,
      bio: 'Design Lead at DesignFlow. We focus on creating beautiful, accessible user experiences.',
      location: 'London, UK',
      headline: 'Creative Director',
      website: 'https://designflow.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    },
  });

  // ────────────────────────────────────────────────
  // Create Freelancers
  // ────────────────────────────────────────────────
  const freelancer1 = await prisma.user.create({
    data: {
      email: 'alex@coderunner.com',
      password: hashedPassword,
      firstName: 'Alex',
      lastName: 'CodeRunner',
      role: UserRole.FREELANCER,
      bio: 'Full-stack wizard with 5+ years of experience in React, Node.js, and Cloud Architecture. I turn complex problems into elegant code.',
      location: 'San Francisco, USA',
      headline: 'Full Stack Architect | React & Node.js Expert',
      skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
      hourlyRate: 85,
      website: 'https://alexcode.dev',
      github: 'https://github.com/alexcoderunner',
      linkedin: 'https://linkedin.com/in/alexcode',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
      languages: ['English (Native)', 'French (Fluent)'],
    },
  });

  const freelancer2 = await prisma.user.create({
    data: {
      email: 'elena@pixels.io',
      password: hashedPassword,
      firstName: 'Elena',
      lastName: 'PixelPerfect',
      role: UserRole.FREELANCER,
      bio: 'Passionate UI/UX designer specializing in modern, high-converting interfaces. Expert in Figma and Design Systems.',
      location: 'Barcelona, Spain',
      headline: 'Senior UI/UX Designer & Brand Strategist',
      skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Prototyping', 'Framer Motion', 'Branding'],
      hourlyRate: 65,
      website: 'https://elenadesign.pt',
      linkedin: 'https://linkedin.com/in/elenapixel',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
      languages: ['English (Fluent)', 'Spanish (Native)', 'Catalan (Native)'],
    },
  });

  const freelancer3 = await prisma.user.create({
    data: {
      email: 'david@backend.io',
      password: hashedPassword,
      firstName: 'David',
      lastName: 'Storm',
      role: UserRole.FREELANCER,
      bio: 'Backend engineer focused on scalability and performance. I love Rust and Go.',
      location: 'Berlin, Germany',
      headline: 'Backend Engineer | Rust & Go Enthusiast',
      skills: ['Rust', 'Go', 'Kubernetes', 'Redis', 'gRPC', 'Distributed Systems'],
      hourlyRate: 95,
      github: 'https://github.com/davidstorm',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      languages: ['English (Fluent)', 'German (Native)'],
    },
  });

  // ────────────────────────────────────────────────
  // Create Jobs
  // ────────────────────────────────────────────────
  const job1 = await prisma.job.create({
    data: {
      title: 'Senior Frontend Architect',
      description: 'We need a highly skilled architect to rebuild our dashboard. The ideal candidate has deep knowledge of Next.js and performance optimization.',
      category: 'Software Engineering',
      skills: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Redux'],
      budget: 5000,
      budgetType: 'FIXED',
      location: 'Remote',
      status: JobStatus.OPEN,
      companyName: 'TechVanguard',
      posterId: employer1.id,
      responsibilities: [
        'Architect the next version of our customer dashboard',
        'Optimize Web Vitals and SEO performance',
        'Mentor junior frontend developers',
      ],
      requirements: [
        '5+ years experience in React/Next.js',
        'Strong TypeScript skills',
        'Experience with large-scale design systems',
      ],
    },
  });

  const job2 = await prisma.job.create({
    data: {
      title: 'Glassmorphism UI/UX Design System',
      description: 'Create a comprehensive design system based on a modern glassmorphic aesthetic. We need Figma components and basic interaction design.',
      category: 'Creative & Design',
      skills: ['Figma', 'UI/UX Design', 'Glassmorphism'],
      budget: 75,
      budgetType: 'HOURLY',
      location: 'Remote',
      status: JobStatus.IN_PROGRESS,
      companyName: 'DesignFlow',
      posterId: employer2.id,
      responsibilities: [
        'Design a 50+ component library in Figma',
        'Document usage and accessibility guidelines',
        'Create high-fidelity prototypes',
      ],
    },
  });

  const job3 = await prisma.job.create({
    data: {
      title: 'Scalable Microservices Backend (Node/NestJS)',
      description: 'Join our team to scale our messaging infrastructure. Experience with Redis and WebSockets is required.',
      category: 'Software Engineering',
      skills: ['Node.js', 'NestJS', 'Redis', 'WebSockets', 'PostgreSQL'],
      budget: 3500,
      budgetType: 'FIXED',
      location: 'Remote',
      status: JobStatus.OPEN,
      companyName: 'TechVanguard',
      posterId: employer1.id,
      responsibilities: [
        'Implement real-time chat features using Socket.io',
        'Optimize database queries for high traffic',
        'Integrate Stripe for automatic payments',
      ],
    },
  });

  // ────────────────────────────────────────────────
  // Create Applications
  // ────────────────────────────────────────────────
  await prisma.application.create({
    data: {
      jobId: job1.id,
      applicantId: freelancer1.id,
      coverLetter: "I've been working with Next.js since its early days and have built several enterprise-grade dashboards. I can help you achieve 100/100 Lighthouse scores.",
      proposedRate: 5000,
      estimatedTime: '3 weeks',
      status: ApplicationStatus.PENDING,
      aiMatchScore: 98,
    },
  });

  await prisma.application.create({
    data: {
      jobId: job2.id,
      applicantId: freelancer2.id,
      coverLetter: "Design is my life. I've already curated several glassmorphic libraries and would love to build a custom one for DesignFlow.",
      proposedRate: 65,
      estimatedTime: '持续',
      status: ApplicationStatus.ACCEPTED,
      aiMatchScore: 95,
    },
  });

  // ────────────────────────────────────────────────
  // Create Messages
  // ────────────────────────────────────────────────
  await prisma.message.create({
    data: {
      senderId: employer1.id,
      receiverId: freelancer1.id,
      content: "Hi Alex, your profile looks impressive. Do you have experience with Server Actions in Next.js 14?",
    },
  });

  await prisma.message.create({
    data: {
      senderId: freelancer1.id,
      receiverId: employer1.id,
      content: "Absolutely, John. I've already migrated two production apps to use Server Actions and the new data fetching patterns. It significantly simplifies the codebase.",
    },
  });

  // ────────────────────────────────────────────────
  // Create Reviews
  // ────────────────────────────────────────────────
  await prisma.review.create({
    data: {
      reviewerId: employer1.id,
      revieweeId: freelancer1.id,
      rating: 5,
      comment: "Alex is a rare find. Technical brilliance combined with great communication.",
    },
  });

  // ────────────────────────────────────────────────
  // Create Payments
  // ────────────────────────────────────────────────
  await prisma.payment.create({
    data: {
      userId: freelancer2.id,
      amount: 450,
      status: 'COMPLETED',
      currency: 'usd',
    },
  });

  await prisma.payment.create({
    data: {
      userId: freelancer1.id,
      amount: 1200,
      status: 'PENDING',
      currency: 'usd',
    },
  });

  // ────────────────────────────────────────────────
  // Create Notifications
  // ────────────────────────────────────────────────
  await prisma.notification.create({
    data: {
      userId: employer1.id,
      message: "You have a new application for 'Senior Frontend Architect'",
      type: 'JOB',
    },
  });

  await prisma.notification.create({
    data: {
      userId: freelancer1.id,
      message: "John Employer sent you a message.",
      type: 'MESSAGE',
    },
  });

  await prisma.notification.create({
    data: {
      userId: admin.id,
      message: "System maintenance scheduled for tonight at 2 AM.",
      type: 'SYSTEM',
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });