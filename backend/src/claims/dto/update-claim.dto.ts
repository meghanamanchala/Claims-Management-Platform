import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ClaimStatus } from '../schemas/claim.schema';

export class UpdateClaimDto {
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(ClaimStatus, { message: 'Status must be APPROVED or REJECTED' })
  status: ClaimStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Approved amount must be a number' })
  @Min(0, { message: 'Approved amount cannot be negative' })
  approvedAmount?: number;

  @IsOptional()
  @IsString()
  insurerComments?: string;
}
