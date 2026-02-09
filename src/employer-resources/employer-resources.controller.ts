import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { EmployerResourcesService } from './employer-resources.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('employer-resources')
export class EmployerResourcesController {
    constructor(private readonly employerResourcesService: EmployerResourcesService) { }

    @Get('categories')
    getCategories() {
        return this.employerResourcesService.getCategories();
    }

    @Get('guides')
    getGuides() {
        return this.employerResourcesService.getGuides();
    }

    @Get('downloads')
    getDownloads() {
        return this.employerResourcesService.getDownloads();
    }

    @Get('faqs')
    getFaqs() {
        return this.employerResourcesService.getFaqs();
    }

    // Admin Routes - Categories
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post('categories')
    createCategory(@Body() data: any) {
        return this.employerResourcesService.createCategory(data);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Put('categories/:id')
    updateCategory(@Param('id') id: string, @Body() data: any) {
        return this.employerResourcesService.updateCategory(id, data);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete('categories/:id')
    deleteCategory(@Param('id') id: string) {
        return this.employerResourcesService.deleteCategory(id);
    }

    // Admin Routes - Guides
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post('guides')
    createGuide(@Body() data: any) {
        return this.employerResourcesService.createGuide(data);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Put('guides/:id')
    updateGuide(@Param('id') id: string, @Body() data: any) {
        return this.employerResourcesService.updateGuide(id, data);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete('guides/:id')
    deleteGuide(@Param('id') id: string) {
        return this.employerResourcesService.deleteGuide(id);
    }

    // Admin Routes - Downloads
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post('downloads')
    createDownload(@Body() data: any) {
        return this.employerResourcesService.createDownload(data);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Put('downloads/:id')
    updateDownload(@Param('id') id: string, @Body() data: any) {
        return this.employerResourcesService.updateDownload(id, data);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete('downloads/:id')
    deleteDownload(@Param('id') id: string) {
        return this.employerResourcesService.deleteDownload(id);
    }

    // Admin Routes - FAQs
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post('faqs')
    createFaq(@Body() data: any) {
        return this.employerResourcesService.createFaq(data);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Put('faqs/:id')
    updateFaq(@Param('id') id: string, @Body() data: any) {
        return this.employerResourcesService.updateFaq(id, data);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete('faqs/:id')
    deleteFaq(@Param('id') id: string) {
        return this.employerResourcesService.deleteFaq(id);
    }
}
