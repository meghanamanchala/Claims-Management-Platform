import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClaimDto {
  @IsNotEmpty({ message: 'Patient Name is required' })
  @IsString()
  patientName: string;

  @IsNotEmpty({ message: 'Patient Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  patientEmail: string;

  @IsNotEmpty({ message: 'Claim Amount is required' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Claim amount must be a number' })
  @Min(1, { message: 'Claim amount must be greater than 0' })
  claimAmount: number;

  @IsNotEmpty({ message: 'Description is required' })
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  documentUrl?: string;

  @IsOptional()
  @IsString()
  documentOriginalName?: string;

  @IsOptional()
  @IsString()
  documentData?: string;

  @IsOptional()
  @IsString()
  documentMimeType?: string;
}
