import { IsNotEmpty, IsNumber, IsEnum, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export enum EditRequestType {
  PROJECT_UPDATE = 'project_update',
  USER_UPDATE = 'user_update',
}

export class CreateEditRequestDto {
  @IsNumber()
  @IsNotEmpty()
  projectId: number;

  @IsEnum(EditRequestType)
  @IsNotEmpty()
  requestType: EditRequestType;

  @IsObject()
  @IsNotEmpty()
  currentData: Record<string, any>;

  @IsObject()
  @IsNotEmpty()
  requestedData: Record<string, any>;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}
