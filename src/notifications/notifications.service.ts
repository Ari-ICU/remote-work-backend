import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
    constructor(
        private prisma: PrismaService,
        private gateway: NotificationsGateway
    ) { }

    async findAll(userId: string) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async create(userId: string, data: { message: string, type?: string }) {
        const notification = await this.prisma.notification.create({
            data: {
                userId,
                message: data.message,
                type: data.type || 'SYSTEM',
            },
        });

        // Emit real-time event
        this.gateway.sendToUser(userId, 'newNotification', notification);

        return notification;
    }

    async markAsRead(id: string) {
        return this.prisma.notification.update({
            where: { id },
            data: { read: true },
        });
    }

    async markAllAsRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
    }
}
