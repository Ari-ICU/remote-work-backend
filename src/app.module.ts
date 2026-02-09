import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JobsModule } from './jobs/jobs.module';
import { ApplicationsModule } from './applications/applications.module';
import { PaymentsModule } from './payments/payments.module';
import { MessagingModule } from './messaging/messaging.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AiClientModule } from './ai-client/ai-client.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AdminModule } from './admin/admin.module';
import { PricingModule } from './pricing/pricing.module';
import { SalaryGuideModule } from './salary-guide/salary-guide.module';
import { join } from 'path';

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), 'public'),
            serveRoot: '/public',
        }),
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),

        // Bull Queue for background jobs
        BullModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                redis: {
                    host: configService.get('REDIS_HOST') || 'localhost',
                    port: parseInt(configService.get('REDIS_PORT')) || 6379,
                },
            }),
        }),

        // Database
        PrismaModule,

        // Feature modules
        AuthModule,
        UsersModule,
        JobsModule,
        ApplicationsModule,
        PaymentsModule,
        MessagingModule,
        NotificationsModule,
        AiClientModule,
        AdminModule,
        PricingModule,
        SalaryGuideModule,
    ],
})
export class AppModule { }
