import { Module } from '@nestjs/common';
import { HiringSolutionsService } from './hiring-solutions.service';
import { HiringSolutionsController } from './hiring-solutions.controller';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [HiringSolutionsController],
    providers: [HiringSolutionsService],
    exports: [HiringSolutionsService],
})
export class HiringSolutionsModule { }
