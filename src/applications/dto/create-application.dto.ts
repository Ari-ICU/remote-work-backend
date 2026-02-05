import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApplicationDto {
    @ApiProperty({ example: 'I am highly interested in this project and have 5 years of experience...' })
    @IsString()
    coverLetter: string;

    @ApiProperty({ example: 50.0 })
    @IsNumber()
    proposedRate: number;

    @ApiProperty({ required: false, example: '2 weeks' })
    @IsString()
    @IsOptional()
    estimatedTime?: string;
}
