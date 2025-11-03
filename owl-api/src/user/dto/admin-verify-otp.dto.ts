import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class AdminVerifyOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otpCode: string;
}

