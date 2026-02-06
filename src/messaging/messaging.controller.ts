import { Controller, Get, Post, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

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
    @Get('unread-count')
    @ApiOperation({ summary: 'Get total unread messages count' })
    getUnreadCount(@Request() req) {
        return this.messagingService.getUnreadCount(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get(':otherUserId')
    @ApiOperation({ summary: 'Get chat history with a specific user' })
    getMessages(@Request() req, @Param('otherUserId') otherUserId: string) {
        return this.messagingService.getMessages(req.user.id, otherUserId);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post('delete/:otherUserId')
    @ApiOperation({ summary: 'Delete conversation with a specific user' })
    deleteConversation(@Request() req, @Param('otherUserId') otherUserId: string) {
        return this.messagingService.deleteConversation(req.user.id, otherUserId);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: join(process.cwd(), 'public/uploads'),
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, `chat-${uniqueSuffix}${extname(file.originalname)}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf|doc|docx)$/)) {
                return cb(new Error('File type not supported!'), false);
            }
            cb(null, true);
        },
    }))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiOperation({ summary: 'Upload chat attachment' })
    async uploadAttachment(@Request() req, @UploadedFile() file) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }
        const fileUrl = `/public/uploads/${file.filename}`;
        return {
            fileUrl,
            filename: file.originalname,
            mimetype: file.mimetype
        };
    }
}
