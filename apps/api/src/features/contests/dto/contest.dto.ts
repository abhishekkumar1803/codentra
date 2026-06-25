import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ContestStatus, ContestType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateContestDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsEnum(ContestType)
  type!: ContestType;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;

  @IsInt()
  @Min(15)
  durationMinutes!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxParticipants?: number;
}

export class UpdateContestDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @IsOptional()
  @IsEnum(ContestType)
  type?: ContestType;

  @IsOptional()
  @IsEnum(ContestStatus)
  status?: ContestStatus;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  durationMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxParticipants?: number;
}

export class ListContestsQueryDto {
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
  @IsEnum(ContestType)
  type?: ContestType;

  @IsOptional()
  @IsEnum(ContestType)
  excludeType?: ContestType;

  @IsOptional()
  @IsEnum(ContestStatus)
  status?: ContestStatus;
}
