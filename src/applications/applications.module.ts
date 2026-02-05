import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { PrismaModule } from '../common/prisma/prisma.module';
import { AiClientModule } from '../ai-client/ai-client.module';

@Module({
    imports: [PrismaModule, AiClientModule],
    controllers: [ApplicationsController],
    providers: [ApplicationsService],
    exports: [ApplicationsService],
})
export class ApplicationsModule { }
