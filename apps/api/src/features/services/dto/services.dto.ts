import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';

export enum ServiceBookingType {
  RESUME_REVIEW = 'RESUME_REVIEW',
  MOCK_INTERVIEW = 'MOCK_INTERVIEW',
  CAREER_CALL = 'CAREER_CALL',
  LINKEDIN_REVIEW = 'LINKEDIN_REVIEW',
}

export class BookServiceDto {
  @IsEnum(ServiceBookingType)
  type!: ServiceBookingType;

  @IsOptional()
  @IsString()
  preferredDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUrl()
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  resumeUrl?: string;
}

export class ListBookingsQueryDto {
  @IsOptional()
  @IsEnum(ServiceBookingType)
  type?: ServiceBookingType;

  @IsOptional()
  @IsString()
  status?: string;
}
