import { Module } from '@nestjs/common';
import { MessagingGateway } from './messaging.gateway';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [MessagingGateway],
})
export class MessagingModule { }
