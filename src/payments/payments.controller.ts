import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post('create-intent')
    @ApiOperation({ summary: 'Create payment intent' })
    createPaymentIntent(@Body() amount: number) {
        return this.paymentsService.createPaymentIntent(amount);
    }
}
