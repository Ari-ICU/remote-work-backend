import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post()
    @ApiOperation({ summary: 'Create a new review' })
    create(@Request() req, @Body() createReviewDto: CreateReviewDto) {
        return this.reviewsService.create(req.user.id, createReviewDto);
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Get reviews for a user' })
    findAllByUser(@Param('userId') userId: string) {
        return this.reviewsService.findAllByReviewee(userId);
    }
}
