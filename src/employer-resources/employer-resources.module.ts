import { Module } from '@nestjs/common';
import { EmployerResourcesService } from './employer-resources.service';
import { EmployerResourcesController } from './employer-resources.controller';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [EmployerResourcesController],
    providers: [EmployerResourcesService],
    exports: [EmployerResourcesService],
})
export class EmployerResourcesModule { }
