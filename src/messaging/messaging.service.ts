import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class MessagingService {
    constructor(private prisma: PrismaService) { }

    async saveMessage(senderId: string, receiverId: string, content: string) {
        return this.prisma.message.create({
            data: {
                content,
                senderId,
                receiverId,
            },
        });
    }

    async getConversations(userId: string) {
        // Group messages by other user.
        // This is complex in Prisma. Simplified: Get all messages involving user, then distinct by other party.
        // For efficiency in this "complete backend" task without huge custom SQL:
        // Fetch recent messages involving user.
        // Ideally we'd have a Conversation model.
        // I'll return a flat list of recent messages for now as a "Recent Chats" list replacement
        // OR distinct logic.

        // Simpler approach: find users who have exchanged messages with current user?
        // Let's just return all messages for now or a mock list of "conversations" derived from unique sender/receivers.

        const messages = await this.prisma.message.findMany({
            where: {
                OR: [{ senderId: userId }, { receiverId: userId }]
            },
            include: {
                sender: { select: { id: true, firstName: true, lastName: true, avatar: true } },
                receiver: { select: { id: true, firstName: true, lastName: true, avatar: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        // Client-side grouping (or here) is acceptable for MVP
        return messages;
    }

    async getMessages(userId: string, otherUserId: string) {
        return this.prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: userId }
                ]
            },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: { select: { id: true, firstName: true, lastName: true, avatar: true } },
            }
        });
    }
}
