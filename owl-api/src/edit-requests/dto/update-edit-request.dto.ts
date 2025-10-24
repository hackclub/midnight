import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class UpdateEditRequestDto {
  @IsEnum(RequestStatus)
  @IsOptional()
  status?: RequestStatus;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}
