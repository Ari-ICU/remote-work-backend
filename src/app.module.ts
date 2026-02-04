import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
// import { AuthModule } from './auth/auth.module';
// import { UsersModule } from './users/users.module';
// import { JobsModule } from './jobs/jobs.module';
// import { ApplicationsModule } from './applications/applications.module';
// import { PaymentsModule } from './payments/payments.module';
// import { MessagingModule } from './messaging/messaging.module';
// import { NotificationsModule } from './notifications/notifications.module';
// import { AiClientModule } from './ai-client/ai-client.module';
import { PrismaModule } from './common/prisma/prisma.module';

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),

        // Bull Queue for background jobs
        BullModule.forRoot({
            redis: {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT) || 6379,
            },
        }),

        // Database
        PrismaModule,

        // Feature modules
        // AuthModule,
        // UsersModule,
        // JobsModule,
        // ApplicationsModule,
        // PaymentsModule,
        // MessagingModule,
        // NotificationsModule,
        // AiClientModule,
    ],
})
export class AppModule { }
