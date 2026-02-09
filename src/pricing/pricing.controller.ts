import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    SetMetadata
} from '@nestjs/common';
import { PricingService } from './pricing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('pricing')
export class PricingController {
    constructor(private readonly pricingService: PricingService) { }

    @Get('plans')
    async getAllPlans() {
        return this.pricingService.getAllPlans();
    }

    @Get('plans/:id')
    async getPlanById(@Param('id') id: string) {
        return this.pricingService.getPlanById(id);
    }

    @Post('admin/plans')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async createPlan(@Body() data: any) {
        return this.pricingService.createPlan(data);
    }

    @Patch('admin/plans/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async updatePlan(@Param('id') id: string, @Body() data: any) {
        return this.pricingService.updatePlan(id, data);
    }

    @Delete('admin/plans/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async deletePlan(@Param('id') id: string) {
        return this.pricingService.deletePlan(id);
    }

    @Post('seed')
    async seed() {
        await this.pricingService.seedInitialPlans();
        return { message: 'Pricing plans seeded successfully' };
    }
}
