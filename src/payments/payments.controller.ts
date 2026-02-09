import { Controller, Post, Get, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post('create-intent')
    @ApiOperation({ summary: 'Create payment intent for PayPal, Card, or KHQR' })
    createPaymentIntent(@Body() createPaymentIntentDto: CreatePaymentIntentDto) {
        return this.paymentsService.createPaymentIntent(createPaymentIntentDto);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post('connect-method')
    @ApiOperation({ summary: 'Connect payment method (PayPal, Card, or KHQR) to enable job posting' })
    connectPaymentMethod(@Request() req, @Body() paymentMethodData: any) {
        return this.paymentsService.connectPaymentMethod(req.user.id, paymentMethodData);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Delete('disconnect-method')
    @ApiOperation({ summary: 'Disconnect payment method' })
    disconnectPaymentMethod(@Request() req) {
        return this.paymentsService.disconnectPaymentMethod(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get('status')
    @ApiOperation({ summary: 'Get payment method status' })
    getPaymentStatus(@Request() req) {
        return this.paymentsService.getPaymentStatus(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post('process')
    @ApiOperation({ summary: 'Process a payment' })
    processPayment(@Request() req, @Body() paymentData: any) {
        return this.paymentsService.processPayment(req.user.id, paymentData);
    }
}
