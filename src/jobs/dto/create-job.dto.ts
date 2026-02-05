import { IsString, IsNumber, IsArray, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJobDto {
  @ApiProperty({ example: 'Build a React Website' })
  @IsString() title: string;

  @ApiProperty({ example: 'Need a responsive website with 5 pages...' })
  @IsString() description: string;

  @ApiProperty({ example: 'Web Development' })
  @IsString() category: string;

  @ApiProperty({ example: ['React', 'Node.js', 'TypeScript'] })
  @IsArray() @IsString({ each: true }) skills: string[];

  @ApiProperty({ example: 1000 })
  @IsNumber() budget: number;

  @ApiProperty({ example: 'FIXED', enum: ['FIXED', 'HOURLY'] })
  @IsString() budgetType: string;

  @ApiProperty({ required: false, default: true })
  @IsBoolean() @IsOptional() remote?: boolean;
}