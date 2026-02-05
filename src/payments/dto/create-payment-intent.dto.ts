import { IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
    @ApiProperty({ example: 50.00, description: 'Amount to pay' })
    @IsNumber()
    amount: number;

    @ApiProperty({ example: 'usd', description: 'Currency code', default: 'usd', required: false })
    @IsString()
    @IsOptional()
    currency?: string;
}
