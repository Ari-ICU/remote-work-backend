import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

export enum PaymentProvider {
    PAYPAL = 'PAYPAL',
    CARD = 'CARD',
    KHQR = 'KHQR'
}

@Injectable()
export class PaymentsService {
    constructor(private prisma: PrismaService) { }

    async createPaymentIntent(data: any) {
        const { amount, currency = 'usd', provider = PaymentProvider.CARD } = data;

        // Generate mock payment intent based on provider
        let paymentIntent: any = {
            amount,
            currency,
            provider,
            status: 'pending'
        };

        switch (provider) {
            case PaymentProvider.PAYPAL:
                paymentIntent.paypalOrderId = 'PAYPAL_' + Math.random().toString(36).substring(7);
                paymentIntent.approvalUrl = `https://www.paypal.com/checkoutnow?token=${paymentIntent.paypalOrderId}`;
                break;

            case PaymentProvider.CARD:
                paymentIntent.clientSecret = 'card_secret_' + Math.random().toString(36).substring(7);
                break;

            case PaymentProvider.KHQR:
                // Generate KHQR code (mock)
                paymentIntent.qrCode = this.generateKHQRCode(amount, currency);
                paymentIntent.qrCodeUrl = `data:image/svg+xml;base64,${Buffer.from(this.generateQRSVG(paymentIntent.qrCode)).toString('base64')}`;
                break;

            default:
                throw new BadRequestException('Invalid payment provider');
        }

        return paymentIntent;
    }

    async connectPaymentMethod(userId: string, paymentMethodData: any) {
        const { provider, paymentDetails } = paymentMethodData;

        if (!Object.values(PaymentProvider).includes(provider)) {
            throw new BadRequestException('Invalid payment provider');
        }

        let paymentProviderId: string;

        switch (provider) {
            case PaymentProvider.PAYPAL:
                // In production, verify PayPal account
                paymentProviderId = paymentDetails.email || 'paypal_' + Math.random().toString(36).substring(7);
                break;

            case PaymentProvider.CARD:
                // In production, tokenize card with payment processor
                paymentProviderId = 'card_' + Math.random().toString(36).substring(7);
                break;

            case PaymentProvider.KHQR:
                // Store KHQR account/phone number
                paymentProviderId = paymentDetails.phoneNumber || 'khqr_' + Math.random().toString(36).substring(7);
                break;

            default:
                throw new BadRequestException('Invalid payment provider');
        }

        // Update user to mark payment method as connected
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                paymentProvider: provider,
                paymentProviderId,
                hasPaymentMethod: true
            },
            select: {
                id: true,
                email: true,
                hasPaymentMethod: true,
                paymentProvider: true,
                paymentProviderId: true
            }
        });
    }

    async disconnectPaymentMethod(userId: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                hasPaymentMethod: false,
                paymentProvider: null,
                paymentProviderId: null
            }
        });
    }

    async getPaymentStatus(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                hasPaymentMethod: true,
                paymentProvider: true,
                paymentProviderId: true
            }
        });

        return {
            hasPaymentMethod: user?.hasPaymentMethod || false,
            paymentProvider: user?.paymentProvider,
            paymentProviderId: user?.paymentProviderId
        };
    }

    async processPayment(userId: string, paymentData: any) {
        const { amount, currency, provider, jobId } = paymentData;

        // Create payment record
        const payment = await this.prisma.payment.create({
            data: {
                userId,
                amount,
                currency: currency || 'usd',
                provider: provider || PaymentProvider.CARD,
                jobId,
                status: 'PENDING'
            }
        });

        // In production, process actual payment with provider
        // For now, auto-approve
        const updatedPayment = await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: 'COMPLETED',
                providerPaymentId: `${provider}_${Math.random().toString(36).substring(7)}`
            }
        });

        return updatedPayment;
    }

    // Helper function to generate KHQR code (simplified)
    private generateKHQRCode(amount: number, currency: string): string {
        // KHQR format: merchant_id|amount|currency|reference
        const merchantId = 'MERCHANT_123456';
        const reference = 'REF_' + Date.now();
        return `${merchantId}|${amount}|${currency.toUpperCase()}|${reference}`;
    }

    // Helper function to generate QR code SVG
    private generateQRSVG(data: string): string {
        // Simple SVG QR code representation (in production, use a proper QR library)
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
            <rect width="200" height="200" fill="white"/>
            <text x="100" y="100" text-anchor="middle" font-size="12" fill="black">
                KHQR: ${data.substring(0, 20)}...
            </text>
        </svg>`;
    }
}
