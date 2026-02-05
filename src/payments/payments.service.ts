import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentsService {
    async createPaymentIntent(amount: number) {
        return { clientSecret: 'mock_secret_key', amount };
    }
}
