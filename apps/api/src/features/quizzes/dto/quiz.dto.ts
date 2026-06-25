import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class QuizOptionInputDto {
  @IsString()
  @MinLength(1)
  text!: string;

  @IsBoolean()
  isCorrect!: boolean;

  @IsInt()
  @Min(0)
  orderIndex!: number;
}

export class CreateQuizQuestionDto {
  @IsString()
  @MinLength(3)
  text!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  points?: number;

  @IsInt()
  @Min(0)
  orderIndex!: number;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => QuizOptionInputDto)
  options!: QuizOptionInputDto[];
}

export class UpdateQuizQuestionDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  text?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  points?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => QuizOptionInputDto)
  options?: QuizOptionInputDto[];
}

export class QuizAnswerInputDto {
  @IsUUID()
  questionId!: string;

  @IsUUID()
  optionId!: string;
}

export class SubmitQuizDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerInputDto)
  answers!: QuizAnswerInputDto[];
}
