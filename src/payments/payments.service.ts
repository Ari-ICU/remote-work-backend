import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentsService {
    async createPaymentIntent(data: any) {
        const { amount, currency = 'usd' } = data;
        return {
            clientSecret: 'mock_secret_key_' + Math.random().toString(36).substring(7),
            amount,
            currency,
            status: 'pending'
        };
    }
}
