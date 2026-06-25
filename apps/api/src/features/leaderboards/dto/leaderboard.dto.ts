import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { LeaderboardPeriod } from '@prisma/client';

export class ListLeaderboardQueryDto {
  @IsOptional()
  @IsEnum(LeaderboardPeriod)
  period?: LeaderboardPeriod;

  @IsOptional()
  @IsUUID()
  contestId?: string;

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
}
