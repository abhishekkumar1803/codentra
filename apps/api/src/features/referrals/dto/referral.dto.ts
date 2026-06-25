import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ReferralStatus } from '@prisma/client';

export class ListReferralsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsEnum(ReferralStatus)
  status?: ReferralStatus;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

export class CreateReferralDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  company!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(255)
  roleTitle!: string;

  @IsString()
  @MinLength(20)
  description!: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;
}

export class ExpressInterestDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}

export class UpdateReferralDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  company?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  roleTitle?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  description?: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsEnum(ReferralStatus)
  status?: ReferralStatus;
}
