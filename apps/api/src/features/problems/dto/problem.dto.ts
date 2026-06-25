import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { CodeLanguage } from '@prisma/client';

export class RunCodeDto {
  @IsEnum(CodeLanguage)
  language!: CodeLanguage;

  @IsString()
  @IsNotEmpty()
  sourceCode!: string;

  @IsOptional()
  @IsString()
  input?: string;

  @IsOptional()
  @IsBoolean()
  runSamples?: boolean;
}

export class SubmitCodeDto {
  @IsEnum(CodeLanguage)
  language!: CodeLanguage;

  @IsString()
  @IsNotEmpty()
  sourceCode!: string;
}

export class CreateProblemDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  inputFormat!: string;

  @IsString()
  @IsNotEmpty()
  outputFormat!: string;

  @IsOptional()
  @IsString()
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';

  @IsOptional()
  @IsInt()
  @Min(1)
  points?: number;

  @IsOptional()
  @IsInt()
  @Min(100)
  timeLimitMs?: number;

  @IsOptional()
  @IsInt()
  @Min(16)
  memoryMb?: number;

  @IsOptional()
  starterCode?: Record<string, string>;

  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;
}

export class CreateTestCaseDto {
  @IsString()
  @IsNotEmpty()
  input!: string;

  @IsString()
  @IsNotEmpty()
  output!: string;

  @IsOptional()
  isSample?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;
}

export class ListSubmissionsQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
