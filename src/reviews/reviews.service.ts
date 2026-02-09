import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
    constructor(private prisma: PrismaService) { }

    async create(reviewerId: string, createReviewDto: CreateReviewDto) {
        if (reviewerId === createReviewDto.revieweeId) {
            throw new BadRequestException('You cannot review yourself');
        }

        // Check if user exists
        const reviewee = await this.prisma.user.findUnique({
            where: { id: createReviewDto.revieweeId },
        });

        if (!reviewee) {
            throw new BadRequestException('User not found');
        }

        return this.prisma.review.create({
            data: {
                rating: createReviewDto.rating,
                comment: createReviewDto.comment,
                reviewerId: reviewerId,
                revieweeId: createReviewDto.revieweeId,
            },
            include: {
                reviewer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
            },
        });
    }

    async findAllByReviewee(revieweeId: string) {
        return this.prisma.review.findMany({
            where: { revieweeId },
            include: {
                reviewer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}
