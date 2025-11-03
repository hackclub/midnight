import { Controller, Post, Body, Get, UseGuards, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { AuthGuard } from './auth.guard';

@Controller('api/user/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async requestOtp(@Body() loginDto: LoginDto) {
    return this.authService.requestOtp(loginDto);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.verifyOtp(verifyOtpDto);
    
    if (result.sessionId) {
      // Set secure HTTP-only cookie
      res.cookie('sessionId', result.sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // Changed from 'strict' to 'lax' for cross-origin requests
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost', // Set domain for development
      });
      
      // Set email cookie for new users
      if (result.isNewUser && result.email) {
        res.cookie('email', result.email, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax', // Changed from 'strict' to 'lax' for cross-origin requests
          maxAge: 10 * 60 * 1000, // 10 minutes
          path: '/',
          domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost', // Set domain for development
        });
      }
    }
    
    return result;
  }

  @Post('complete-profile')
  async completeProfile(
    @Body() completeProfileDto: CompleteProfileDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sessionId = req.cookies.sessionId;
    const email = req.cookies.email;
    
    const result = await this.authService.completeProfile(completeProfileDto, sessionId, email);
    
    // Clear email cookie after profile completion
    res.clearCookie('email');
    
    return result;
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getCurrentUser(@Req() req: Request) {
    return this.authService.getCurrentUser(req.cookies.sessionId);
  }

  @Post('verify-session')
  async verifySession(@Body() body: { sessionId: string }) {
    const sessionId = body.sessionId;
    return this.authService.getCurrentUser(sessionId);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('sessionId');
    res.clearCookie('email');
    return { message: 'Logged out successfully' };
  }

  @Post('complete-onboarding')
  @UseGuards(AuthGuard)
  async completeOnboarding(@Req() req: Request) {
    const userId = req.user.userId;
    return this.authService.completeOnboarding(userId);
  }

  @Get('onboarding-status')
  @UseGuards(AuthGuard)
  async getOnboardingStatus(@Req() req: Request) {
    const userId = req.user.userId;
    return this.authService.getOnboardingStatus(userId);
  }

  @Post('hackatime-link/send-otp')
  @UseGuards(AuthGuard)
  async sendHackatimeLinkOtp(@Req() req: Request, @Body() body: { email: string }) {
    const userId = req.user.userId;
    return this.authService.sendHackatimeLinkOtp(userId, body.email);
  }

  @Post('hackatime-link/verify-otp')
  @UseGuards(AuthGuard)
  async verifyHackatimeLinkOtp(@Req() req: Request, @Body() body: { otp: string }) {
    const userId = req.user.userId;
    return this.authService.verifyHackatimeLinkOtp(userId, body.otp);
  }
}
