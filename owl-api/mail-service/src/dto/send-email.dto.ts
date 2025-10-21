import { IsEmail, IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';

export class SendEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsNumber()
  rsvpNumber?: number;

  @IsOptional()
  @IsString()
  stickerToken?: string;
}

