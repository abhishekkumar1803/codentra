import { IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class SubmitSystemDesignDto {
  @IsString()
  @MinLength(100)
  solution!: string;

  @IsOptional()
  @IsUrl()
  diagramUrl?: string;
}
