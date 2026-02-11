import { IsString, IsNumber, IsArray, IsOptional, IsBoolean, Min } from 'class-validator';
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
  @IsNumber() @Min(0) budget: number;

  @ApiProperty({ example: 'FIXED', enum: ['FIXED', 'HOURLY'] })
  @IsString() budgetType: string;

  @ApiProperty({ required: false, default: true })
  @IsBoolean() @IsOptional() remote?: boolean;

  @ApiProperty({ example: ['Design UI components', 'Write documentation'], required: false })
  @IsArray() @IsString({ each: true }) @IsOptional() responsibilities?: string[];

  @ApiProperty({ example: ['3+ years React experience', 'CS degree'], required: false })
  @IsArray() @IsString({ each: true }) @IsOptional() requirements?: string[];

  @ApiProperty({ example: 'TechCorp Solutions', required: false })
  @IsString() @IsOptional() companyName?: string;

  @ApiProperty({ example: 'Remote', required: false })
  @IsString() @IsOptional() location?: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean() @IsOptional() featured?: boolean;

  @ApiProperty({ example: 'OPEN', enum: ['DRAFT', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], required: false })
  @IsString() @IsOptional() status?: string;
}