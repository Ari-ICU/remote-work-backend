import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiClientService } from './ai-client.service';
import { AiClientController } from './ai-client.controller';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
    imports: [HttpModule, PrismaModule],
    controllers: [AiClientController],
    providers: [AiClientService],
    exports: [AiClientService],
})
export class AiClientModule { }
