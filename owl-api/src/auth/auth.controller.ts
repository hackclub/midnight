import { Controller, Post, Body, Get, UseGuards, Req, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
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
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const forwarded = (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress || '';
    const result = await this.authService.verifyOtp(verifyOtpDto, forwarded);
    
    if (result.sessionId) {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' as const : 'lax' as const,
        path: '/',
        domain: process.env.COOKIE_DOMAIN || (process.env.NODE_ENV === 'production' ? undefined : 'localhost'),
      };

      res.cookie('sessionId', result.sessionId, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000,
      });
      
      if (result.isNewUser && result.email) {
        res.cookie('email', result.email, {
          ...cookieOptions,
          maxAge: 10 * 60 * 1000,
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
    
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' as const : 'lax' as const,
      path: '/',
      domain: process.env.COOKIE_DOMAIN || (process.env.NODE_ENV === 'production' ? undefined : 'localhost'),
    };
    
    res.clearCookie('email', cookieOptions);
    
    return result;
  }

  @Get('me')
  @SkipThrottle()
  @UseGuards(AuthGuard)
  async getCurrentUser(@Req() req: Request) {
    return this.authService.getCurrentUser(req.cookies.sessionId);
  }

  @Post('verify-session')
  @UseGuards(AuthGuard)
  async verifySession(@Req() req: Request) {
    const sessionId = req.cookies.sessionId;
    return this.authService.getCurrentUser(sessionId);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Res({ passthrough: true }) res: Response) {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' as const : 'lax' as const,
      path: '/',
      domain: process.env.COOKIE_DOMAIN || (process.env.NODE_ENV === 'production' ? undefined : 'localhost'),
    };

    res.clearCookie('sessionId', cookieOptions);
    res.clearCookie('email', cookieOptions);
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

  @Get('raffle-pos')
  @UseGuards(AuthGuard)
  async getRafflePos(@Req() req: Request) {
    const userId = req.user.userId;
    return this.authService.getRafflePos(userId);
  }
}
