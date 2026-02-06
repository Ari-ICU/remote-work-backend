import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MessagingGateway } from './messaging.gateway';
import { MessagingService } from './messaging.service';
import { MessagingController } from './messaging.controller';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
    imports: [
        PrismaModule,
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '7d' },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [MessagingController],
    providers: [MessagingGateway, MessagingService],
})
export class MessagingModule { }
