import { Controller, Get, Param, UseGuards, Request, Patch, Body, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Throttle } from '@nestjs/throttler';


@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile/me')
  @ApiOperation({ summary: 'Get current logged-in user profile' })
  getProfile(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user profile by ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: join(process.cwd(), 'public/uploads'),
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
  }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { // This is the correct structure for file upload in ApiBody
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload user avatar' })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async uploadAvatar(@Request() req: any, @UploadedFile() file: any) {
    if (!file) {
      console.error('No file uploaded in request');
      console.log('Request headers:', req.headers);
      throw new BadRequestException('No file uploaded');
    }
    console.log(`Avatar uploaded: ${file.filename} for user ${req.user.id}`);
    const avatarUrl = `/public/uploads/${file.filename}`;
    return this.usersService.update(req.user.id, { avatar: avatarUrl });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('resume')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: join(process.cwd(), 'public/uploads'),
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `resume-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(pdf|doc|docx)$/)) {
        return cb(new Error('Only PDF and Word documents are allowed!'), false);
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
  @ApiOperation({ summary: 'Upload user resume' })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async uploadResume(@Request() req: any, @UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const resumeUrl = `/public/uploads/${file.filename}`;
    return this.usersService.update(req.user.id, { resumeUrl: resumeUrl });
  }
}