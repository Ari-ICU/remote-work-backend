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
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, JobStatus } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

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

    @Get('users')
    @ApiOperation({ summary: 'Get all users with pagination' })
    getAllUsers(
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    ) {
        return this.adminService.getAllUsers(page, limit);
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
    ) {
        return this.adminService.getAllJobs(page, limit);
    }

    @Patch('jobs/:id/status')
    @ApiOperation({ summary: 'Update job status' })
    updateJobStatus(@Param('id') id: string, @Body('status') status: JobStatus) {
        return this.adminService.updateJobStatus(id, status);
    }
}
