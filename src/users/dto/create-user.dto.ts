import { IsEmail, IsString, IsEnum, IsOptional, MinLength, Matches } from 'class-validator';
import { UserRole } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: 'Password123!', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is too weak. It must contain at least one uppercase letter, one lowercase letter, and one number or special character.',
  })
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ enum: UserRole, default: UserRole.FREELANCER })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ required: false, example: 'https://example.com/avatar.jpg' })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ required: false, example: 'Experienced Full Stack Developer' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ required: false, example: 'Phnom Penh, Cambodia' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ required: false, example: 'Senior Developer' })
  @IsString()
  @IsOptional()
  headline?: string;

  @ApiProperty({ required: false, example: 'https://mysite.com' })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiProperty({ required: false, example: 'github_user' })
  @IsString()
  @IsOptional()
  github?: string;

  @ApiProperty({ required: false, example: 'linkedin_user' })
  @IsString()
  @IsOptional()
  linkedin?: string;

  @ApiProperty({ required: false, example: ['React', 'Node.js'] })
  @IsOptional()
  skills?: string[];

  @ApiProperty({ required: false, example: 25.0 })
  @IsOptional()
  hourlyRate?: number;

  @ApiProperty({ required: false, example: ['English', 'Khmer'] })
  @IsOptional()
  languages?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  education?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  experience?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  resumeUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  resumeTemplate?: string;
}