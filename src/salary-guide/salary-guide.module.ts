import { Module } from '@nestjs/common';
import { SalaryGuideService } from './salary-guide.service';
import { SalaryGuideController } from './salary-guide.controller';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [SalaryGuideController],
    providers: [SalaryGuideService],
})
export class SalaryGuideModule { }
