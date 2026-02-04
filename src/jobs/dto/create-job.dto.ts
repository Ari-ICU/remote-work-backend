import { IsString, IsNumber, IsArray, IsOptional, IsBoolean } from 'class-validator';

export class CreateJobDto {
  @IsString() title: string;
  @IsString() description: string;
  @IsString() category: string;
  @IsArray() @IsString({ each: true }) skills: string[];
  @IsNumber() budget: number;
  @IsString() budgetType: string;
  @IsBoolean() @IsOptional() remote?: boolean;
}