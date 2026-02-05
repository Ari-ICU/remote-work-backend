import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('messaging')
@Controller('messaging')
export class MessagingController {
    constructor(private readonly messagingService: MessagingService) { }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get('conversations')
    @ApiOperation({ summary: 'Get recent messages (conversations)' })
    getConversations(@Request() req) {
        return this.messagingService.getConversations(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get(':otherUserId')
    @ApiOperation({ summary: 'Get chat history with a specific user' })
    getMessages(@Request() req, @Param('otherUserId') otherUserId: string) {
        return this.messagingService.getMessages(req.user.id, otherUserId);
    }
}
