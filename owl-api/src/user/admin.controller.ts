import { Controller, Post, Get, Body, Headers, HttpCode, HttpException, HttpStatus, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminVerifyOtpDto } from './dto/admin-verify-otp.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { ttl: 900000, limit: 5 } })
  async requestLogin(@Body() body: AdminLoginDto) {
    return await this.adminService.requestAdminLogin(body.email);
  }

  @Post('verify-otp')
  @HttpCode(200)
  @Throttle({ default: { ttl: 900000, limit: 5 } })
  async verifyOtp(@Body() body: AdminVerifyOtpDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.adminService.verifyOTP(body.email, body.otpCode);
    
    res.cookie('admin_session', result.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });
    
    return { success: result.success };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Headers('cookie') cookies: string, @Res({ passthrough: true }) res: Response) {
    const token = this.extractTokenFromCookie(cookies);
    await this.adminService.logout(token);
    
    res.clearCookie('admin_session', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    
    return { success: true };
  }

  @Get('session')
  @HttpCode(200)
  async checkSession(@Headers('cookie') cookies: string) {
    const token = this.extractTokenFromCookie(cookies);
    const session = await this.adminService.validateSession(token);
    return { valid: true, email: session.email };
  }

  private extractTokenFromCookie(cookies: string): string {
    if (!cookies) {
      throw new HttpException(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const cookieArray = cookies.split(';').map(c => c.trim());
    const sessionCookie = cookieArray.find(c => c.startsWith('admin_session='));
    
    if (!sessionCookie) {
      throw new HttpException(
        'Session cookie not found',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return sessionCookie.split('=')[1];
  }
}

