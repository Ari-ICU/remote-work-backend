const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugSessions() {
    try {
        const sessions = await prisma.session.findMany({
            include: { user: { select: { email: true } } },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        console.log('Recent 10 Sessions:');
        sessions.forEach(s => {
            console.log(`- User: ${s.user.email}, Valid: ${s.isValid}, Expires: ${s.expiresAt}, Created: ${s.createdAt}`);
            console.log(`  Token Prefix: ${s.token.substring(0, 20)}...`);
        });

        const total = await prisma.session.count();
        console.log(`Total sessions in DB: ${total}`);

    } catch (error) {
        console.error('Error debugging sessions:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugSessions();
