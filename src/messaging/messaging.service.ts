import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class MessagingService {
    constructor(private prisma: PrismaService) { }

    async saveMessage(senderId: string, receiverId: string, content: string, type: string = 'TEXT', fileUrl?: string) {
        return this.prisma.message.create({
            data: {
                content,
                senderId,
                receiverId,
                type,
                fileUrl
            },
            include: {
                sender: { select: { id: true, firstName: true, lastName: true, avatar: true } },
            }
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
                        senderId: msg.senderId
                    },
                    unreadCount: 0
                });
            }

            // If message is to current user and unread, increment count
            if (msg.receiverId === userId && !msg.read) {
                const conv = conversationMap.get(otherUser.id);
                conv.unreadCount++;
            }
        }

        return Array.from(conversationMap.values());
    }

    async getUnreadCount(userId: string) {
        return this.prisma.message.count({
            where: {
                receiverId: userId,
                read: false
            }
        });
    }

    async getMessages(userId: string, otherUserId: string) {
        // Mark messages as read when fetched
        await this.prisma.message.updateMany({
            where: {
                senderId: otherUserId,
                receiverId: userId,
                read: false
            },
            data: { read: true }
        });

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

    async updateMessage(messageId: string, senderId: string, newContent: string) {
        return this.prisma.message.update({
            where: { id: messageId, senderId }, // Ensure only sender can edit
            data: { content: newContent },
            include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true } } }
        });
    }

    async deleteMessage(messageId: string, senderId: string) {
        return this.prisma.message.delete({
            where: { id: messageId, senderId } // Ensure only sender can delete
        });
    }

    async deleteConversation(userId: string, otherUserId: string) {
        return this.prisma.message.deleteMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: userId }
                ]
            }
        });
    }
}
