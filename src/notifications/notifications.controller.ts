import { Controller, Get, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get()
    @ApiOperation({ summary: 'Get user notifications' })
    findAll() {
        return this.notificationsService.findAll();
    }
}
