import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { HiringSolutionsService } from './hiring-solutions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('hiring-solutions')
export class HiringSolutionsController {
    constructor(private readonly hiringSolutionsService: HiringSolutionsService) { }

    @Get('solutions')
    getSolutions() {
        return this.hiringSolutionsService.getSolutions();
    }

    @Get('stats')
    getStats() {
        return this.hiringSolutionsService.getStats();
    }

    @Get('plans')
    getPlans() {
        return this.hiringSolutionsService.getPlans();
    }

    // Admin routes
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Put('solutions/:id')
    updateSolution(@Param('id') id: string, @Body() data: any) {
        return this.hiringSolutionsService.updateSolution(id, data);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post('solutions')
    createSolution(@Body() data: any) {
        return this.hiringSolutionsService.createSolution(data);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete('solutions/:id')
    deleteSolution(@Param('id') id: string) {
        return this.hiringSolutionsService.deleteSolution(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Put('stats/:id')
    updateStat(@Param('id') id: string, @Body() data: any) {
        return this.hiringSolutionsService.updateStat(id, data);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post('stats')
    createStat(@Body() data: any) {
        return this.hiringSolutionsService.createStat(data);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete('stats/:id')
    deleteStat(@Param('id') id: string) {
        return this.hiringSolutionsService.deleteStat(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Put('plans/:id')
    updatePlan(@Param('id') id: string, @Body() data: any) {
        return this.hiringSolutionsService.updatePlan(id, data);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post('plans')
    createPlan(@Body() data: any) {
        return this.hiringSolutionsService.createPlan(data);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete('plans/:id')
    deletePlan(@Param('id') id: string) {
        return this.hiringSolutionsService.deletePlan(id);
    }
}
