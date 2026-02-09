import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const keys = Object.keys(prisma).filter(key => !key.startsWith('_') && !key.startsWith('$'));
console.log('Available models:', keys);
process.exit(0);
