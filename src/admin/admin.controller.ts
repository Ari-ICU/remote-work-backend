import {
    Controller,
    Get,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
    Query,
    ParseIntPipe,
    Post,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, JobStatus } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('stats')
    @ApiOperation({ summary: 'Get platform statistics' })
    getStats() {
        return this.adminService.getStats();
    }

    @Get('search')
    @ApiOperation({ summary: 'Global admin search' })
    search(@Query('q') query: string) {
        return this.adminService.search(query);
    }

    @Get('users')
    @ApiOperation({ summary: 'Get all users with pagination' })
    getAllUsers(
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
        @Query('search') search?: string,
    ) {
        return this.adminService.getAllUsers(page, limit, search);
    }

    @Post('users')
    @ApiOperation({ summary: 'Create a new user' })
    createUser(@Body() createUserDto: CreateUserDto) {
        return this.adminService.createUser(createUserDto);
    }

    @Patch('users/:id')
    @ApiOperation({ summary: 'Update user details' })
    updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.adminService.updateUser(id, updateUserDto);
    }

    @Patch('users/:id/role')
    @ApiOperation({ summary: 'Update user role' })
    updateUserRole(@Param('id') id: string, @Body('role') role: UserRole) {
        return this.adminService.updateUserRole(id, role);
    }

    @Delete('users/:id')
    @ApiOperation({ summary: 'Delete a user' })
    deleteUser(@Param('id') id: string) {
        return this.adminService.deleteUser(id);
    }

    @Get('jobs')
    @ApiOperation({ summary: 'Get all jobs with pagination' })
    getAllJobs(
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
        @Query('search') search?: string,
    ) {
        return this.adminService.getAllJobs(page, limit, search);
    }

    @Patch('jobs/:id/status')
    @ApiOperation({ summary: 'Update job status' })
    updateJobStatus(@Param('id') id: string, @Body('status') status: JobStatus) {
        return this.adminService.updateJobStatus(id, status);
    }

    @Get('applications')
    @ApiOperation({ summary: 'Get all applications with pagination' })
    getAllApplications(
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    ) {
        return this.adminService.getAllApplications(page, limit);
    }

    @Patch('applications/:id/status')
    @ApiOperation({ summary: 'Update application status' })
    updateApplicationStatus(@Param('id') id: string, @Body('status') status: any) {
        return this.adminService.updateApplicationStatus(id, status);
    }

    @Get('payments')
    @ApiOperation({ summary: 'Get all payments with pagination' })
    getAllPayments(
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    ) {
        return this.adminService.getAllPayments(page, limit);
    }

    @Get('reviews')
    @ApiOperation({ summary: 'Get all reviews' })
    getAllReviews(
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    ) {
        return this.adminService.getAllReviews(page, limit);
    }

    @Delete('reviews/:id')
    @ApiOperation({ summary: 'Delete a review' })
    deleteReview(@Param('id') id: string) {
        return this.adminService.deleteReview(id);
    }

    @Delete('cleanup-test-data')
    @ApiOperation({ summary: 'Remove all Playwright test data' })
    cleanupTestData() {
        return this.adminService.cleanupTestData();
    }

    @Get('settings')
    @ApiOperation({ summary: 'Get platform integration settings' })
    getSettings() {
        return this.adminService.getPlatformSettings();
    }

    @Patch('settings')
    @ApiOperation({ summary: 'Update platform integration settings' })
    updateSettings(@Body() data: any) {
        return this.adminService.updatePlatformSettings(data);
    }
}
