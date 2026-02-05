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
        const messages = await this.prisma.message.findMany({
            where: {
                OR: [{ senderId: userId }, { receiverId: userId }]
            },
            include: {
                sender: { select: { id: true, firstName: true, lastName: true, avatar: true } },
                receiver: { select: { id: true, firstName: true, lastName: true, avatar: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        const conversationMap = new Map();

        for (const msg of messages) {
            const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
            if (!conversationMap.has(otherUser.id)) {
                conversationMap.set(otherUser.id, {
                    otherUser,
                    lastMessage: {
                        content: msg.content,
                        createdAt: msg.createdAt,
                        read: msg.read,
                        senderId: msg.senderId // Useful for knowing if "You: " sent it
                    }
                });
            }
        }

        return Array.from(conversationMap.values());
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
