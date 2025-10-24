import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MailService } from '../mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { randomBytes, randomUUID } from 'crypto';
import { Role } from '../enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async requestOtp(loginDto: LoginDto) {
    const { email } = loginDto;
    
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    let session;
    if (existingUser) {
      await this.prisma.userSession.deleteMany({
        where: { userId: existingUser.userId },
      });
      
      session = await this.prisma.userSession.create({
        data: {
          userId: existingUser.userId,
          otpCode: otp,
          otpExpiresAt: expiresAt,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });
    } else {
      // For new users, create a temporary user first
      const tempUser = await this.prisma.user.create({
        data: {
          email,
          firstName: 'Temporary', // Temporary first name
          lastName: 'User', // Temporary last name
          birthday: new Date('2000-01-01'), // Temporary birthday
          role: 'user', // Default role
        },
      });
      
      session = await this.prisma.userSession.create({
        data: {
          userId: tempUser.userId,
          otpCode: otp,
          otpExpiresAt: expiresAt,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
    }

    await this.mailService.sendImmediateEmail(
      email,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your OTP Code</h2>
          <p>Your one-time password is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
      'Your OTP Code'
    );

    return { message: 'OTP sent to your email', sessionId: session.id };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, otp } = verifyOtpDto;

    const session = await this.prisma.userSession.findFirst({
      where: {
        otpCode: otp,
        otpExpiresAt: { gt: new Date() },
        isVerified: false,
      },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    await this.prisma.userSession.update({
      where: { id: session.id },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    if (existingUser) {
      // Update session with correct user ID
      await this.prisma.userSession.update({
        where: { id: session.id },
        data: { userId: existingUser.userId },
      });

      return {
        message: 'OTP verified successfully',
        user: {
          userId: existingUser.userId,
          email: existingUser.email,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
        },
        sessionId: session.id,
      };
    } else {
      // New user - return session ID for profile completion
      return {
        message: 'OTP verified. Please complete your profile.',
        sessionId: session.id,
        isNewUser: true,
        email: email, // Include email for profile completion
      };
    }
  }

  async completeProfile(completeProfileDto: CompleteProfileDto, sessionId: string, email: string) {
    const { firstName, lastName, birthday, addressLine1, addressLine2, city, state, country, zipCode, airtableRecId } = completeProfileDto;

    const session = await this.prisma.userSession.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!session || !session.isVerified) {
      throw new UnauthorizedException('Invalid session');
    }

    if (!session.user) {
      throw new BadRequestException('User not found in session');
    }

    // Check if this is a temporary user (first name is 'Temporary')
    const isTemporaryUser = session.user.firstName === 'Temporary';
    
    if (!isTemporaryUser) {
      throw new BadRequestException('User profile already completed');
    }

    // Update the existing temporary user
    const user = await this.prisma.user.update({
      where: { userId: session.user.userId },
      data: {
        firstName,
        lastName,
        birthday: new Date(birthday),
        addressLine1,
        addressLine2,
        city,
        state,
        country,
        zipCode,
        airtableRecId,
        onboardedAt: new Date(),
      },
    });

    return {
      message: 'Profile completed successfully',
      user: {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async getCurrentUser(sessionId: string) {
    const session = await this.prisma.userSession.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!session || !session.isVerified || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    return session.user;
  }

  async completeOnboarding(userId: number) {
    const user = await this.prisma.user.update({
      where: { userId },
      data: { onboardComplete: true },
    });

    return {
      message: 'Onboarding completed successfully',
      user: {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        onboardComplete: user.onboardComplete,
      },
    };
  }

  async getOnboardingStatus(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: { onboardComplete: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      onboardComplete: user.onboardComplete,
    };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
