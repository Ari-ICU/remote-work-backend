import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
} from '@nestjs/common';
import { SalaryGuideService } from './salary-guide.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('salary-guide')
@Controller('salary-guide')
export class SalaryGuideController {
    constructor(private readonly salaryGuideService: SalaryGuideService) { }

    @Get()
    @ApiOperation({ summary: 'Get all salary guide data' })
    getSalaryData() {
        return this.salaryGuideService.getSalaryData();
    }

    @Post('categories')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a salary category' })
    createCategory(@Body() data: { name: string; order?: number }) {
        return this.salaryGuideService.createCategory(data);
    }

    @Patch('categories/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Update a salary category' })
    updateCategory(
        @Param('id') id: string,
        @Body() data: { name?: string; order?: number },
    ) {
        return this.salaryGuideService.updateCategory(id, data);
    }

    @Delete('categories/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete a salary category' })
    deleteCategory(@Param('id') id: string) {
        return this.salaryGuideService.deleteCategory(id);
    }

    @Post('roles')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a salary role' })
    createRole(
        @Body()
        data: {
            title: string;
            range: string;
            experience: string;
            categoryId: string;
        },
    ) {
        return this.salaryGuideService.createRole(data);
    }

    @Patch('roles/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Update a salary role' })
    updateRole(
        @Param('id') id: string,
        @Body() data: { title?: string; range?: string; experience?: string },
    ) {
        return this.salaryGuideService.updateRole(id, data);
    }

    @Delete('roles/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete a salary role' })
    deleteRole(@Param('id') id: string) {
        return this.salaryGuideService.deleteRole(id);
    }

    @Post('insights')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a salary insight' })
    createInsight(
        @Body()
        data: {
            icon: string;
            title: string;
            description: string;
            color: string;
            bg: string;
            order?: number;
        },
    ) {
        return this.salaryGuideService.createInsight(data);
    }

    @Patch('insights/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Update a salary insight' })
    updateInsight(
        @Param('id') id: string,
        @Body()
        data: {
            icon?: string;
            title?: string;
            description?: string;
            color?: string;
            bg?: string;
            order?: number;
        },
    ) {
        return this.salaryGuideService.updateInsight(id, data);
    }

    @Delete('insights/:id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete a salary insight' })
    deleteInsight(@Param('id') id: string) {
        return this.salaryGuideService.deleteInsight(id);
    }
}
