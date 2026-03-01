import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';

// Using require for bakong-khqr as it might not have proper TypeScript types or ESM exports
const { BakongKHQR, IndividualInfo, khqrData } = require('bakong-khqr');

export enum PaymentProvider {
    PAYPAL = 'PAYPAL',
    CARD = 'CARD',
    KHQR = 'KHQR'
}

@Injectable()
export class PaymentsService {
    private bakongKHQR: any;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService
    ) {
        this.bakongKHQR = new BakongKHQR();
    }

    async createPaymentIntent(data: any) {
        const { amount, currency = 'usd', provider = PaymentProvider.CARD } = data;

        // Generate payment intent based on provider
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
                // Generate real Bakong KHQR code
                const khqrString = await this.generateKHQRString(amount, currency);
                paymentIntent.qrCode = khqrString;
                paymentIntent.qrCodeUrl = await this.generateQRDataURL(khqrString);
                const individualInfo = await this.getIndividualInfo(amount, currency);
                paymentIntent.md5 = this.bakongKHQR.generateIndividual(individualInfo).data.md5;
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

    private async getIndividualInfo(amount: number, currency: string) {
        // Try to get settings from database first
        const settings = await this.prisma.systemSetting.findMany({
            where: {
                key: {
                    in: ['BAKONG_ACCOUNT_ID', 'BAKONG_MERCHANT_NAME', 'BAKONG_MERCHANT_CITY']
                }
            }
        });

        const settingsMap = settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as any);

        const bakongAccountId = settingsMap['BAKONG_ACCOUNT_ID'] || this.configService.get('BAKONG_ACCOUNT_ID');
        const merchantName = settingsMap['BAKONG_MERCHANT_NAME'] || this.configService.get('BAKONG_MERCHANT_NAME');
        const merchantCity = settingsMap['BAKONG_MERCHANT_CITY'] || this.configService.get('BAKONG_MERCHANT_CITY');

        const khqrCurrency = currency.toLowerCase() === 'khr' ? khqrData.currency.khr : khqrData.currency.usd;

        return new IndividualInfo(
            bakongAccountId,
            merchantName,
            merchantCity,
            {
                amount: amount,
                currency: khqrCurrency,
                billNumber: 'BILL' + Date.now(),
                storeLabel: 'Freelance Platform',
                expirationTimestamp: Date.now() + 600000, // 10 minutes from now in milliseconds (13 digits)
                merchantCategoryCode: '5999' // Miscellaneous Fixed Retail
            }
        );
    }

    // Helper function to generate real KHQR string
    private async generateKHQRString(amount: number, currency: string): Promise<string> {
        const individualInfo = await this.getIndividualInfo(amount, currency);
        const result = this.bakongKHQR.generateIndividual(individualInfo);

        if (result.status && result.status.code !== 0) {
            throw new BadRequestException('Failed to generate KHQR: ' + result.status.message);
        }

        return result.data.qr;
    }

    // Helper function to generate QR code Data URL (image)
    private async generateQRDataURL(text: string): Promise<string> {
        try {
            return await QRCode.toDataURL(text);
        } catch (error) {
            throw new BadRequestException('Failed to generate QR image');
        }
    }
}
