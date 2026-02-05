import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
    async findAll() {
        return [{ id: 1, message: 'Welcome to the platform!', read: false }];
    }
}
