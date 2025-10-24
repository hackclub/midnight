import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis.service';
import * as crypto from 'crypto';

@Injectable()
export class AdminService {
  private readonly ADMIN_WHITELIST: string[];
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly SESSION_EXPIRY_HOURS = 24;

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {
    const whitelist = process.env.ADMIN_EMAIL_WHITELIST || '';
    this.ADMIN_WHITELIST = whitelist.split(',').map(email => email.trim()).filter(Boolean);
    
    if (this.ADMIN_WHITELIST.length === 0) {
      console.warn('WARNING: No admin email whitelist configured. Set ADMIN_EMAIL_WHITELIST environment variable.');
    }
  }

  private generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  private generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async requestAdminLogin(email: string): Promise<{ success: boolean }> {
    if (!this.ADMIN_WHITELIST.includes(email)) {
      throw new HttpException(
        'Unauthorized: Email not in whitelist',
        HttpStatus.FORBIDDEN,
      );
    }

    let adminUser = await this.prisma.adminUser.findUnique({
      where: { email },
    });

    if (!adminUser) {
      adminUser = await this.prisma.adminUser.create({
        data: {
          email,
          isActive: true,
        },
      });
    }

    if (!adminUser.isActive) {
      throw new HttpException(
        'Admin account is inactive',
        HttpStatus.FORBIDDEN,
      );
    }

    const otpCode = this.generateOTP();
    const otpExpiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);
    const sessionExpiresAt = new Date(Date.now() + this.SESSION_EXPIRY_HOURS * 60 * 60 * 1000);

    await this.prisma.adminSession.create({
      data: {
        adminUserId: adminUser.id,
        otpCode,
        otpExpiresAt,
        expiresAt: sessionExpiresAt,
        isVerified: false,
      },
    });

    await this.redis.set(`otp:${email}`, otpCode, this.OTP_EXPIRY_MINUTES * 60);

    console.log(`OTP for ${email}: ${otpCode}`);

    return { success: true };
  }

  async verifyOTP(email: string, otpCode: string): Promise<{ success: boolean; sessionToken: string }> {
    if (!this.ADMIN_WHITELIST.includes(email)) {
      throw new HttpException(
        'Unauthorized: Email not in whitelist',
        HttpStatus.FORBIDDEN,
      );
    }

    const cachedOTP = await this.redis.get(`otp:${email}`);
    
    if (!cachedOTP || cachedOTP !== otpCode) {
      throw new HttpException(
        'Invalid or expired OTP',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const adminUser = await this.prisma.adminUser.findUnique({
      where: { email },
    });

    if (!adminUser) {
      throw new HttpException(
        'Admin user not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const session = await this.prisma.adminSession.findFirst({
      where: {
        adminUserId: adminUser.id,
        otpCode,
        isVerified: false,
        otpExpiresAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!session) {
      throw new HttpException(
        'Invalid or expired OTP',
        HttpStatus.UNAUTHORIZED,
      );
    }

    await this.prisma.adminSession.update({
      where: { id: session.id },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    await this.redis.del(`otp:${email}`);

    const sessionToken = this.generateSessionToken();
    await this.redis.set(
      `session:${sessionToken}`,
      JSON.stringify({ email, sessionId: session.id }),
      this.SESSION_EXPIRY_HOURS * 60 * 60,
    );

    return { success: true, sessionToken };
  }

  async validateSession(sessionToken: string): Promise<{ email: string; sessionId: string }> {
    const sessionData = await this.redis.get(`session:${sessionToken}`);
    
    if (!sessionData) {
      throw new HttpException(
        'Invalid or expired session',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const { email, sessionId } = JSON.parse(sessionData);

    const session = await this.prisma.adminSession.findUnique({
      where: { id: sessionId },
      include: { adminUser: true },
    });

    if (!session || !session.isVerified || session.expiresAt < new Date()) {
      await this.redis.del(`session:${sessionToken}`);
      throw new HttpException(
        'Invalid or expired session',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!session.adminUser.isActive) {
      throw new HttpException(
        'Admin account is inactive',
        HttpStatus.FORBIDDEN,
      );
    }

    return { email, sessionId };
  }

  async logout(sessionToken: string): Promise<{ success: boolean }> {
    const sessionData = await this.redis.get(`session:${sessionToken}`);
    
    if (sessionData) {
      const { sessionId } = JSON.parse(sessionData);
      
      await this.prisma.adminSession.update({
        where: { id: sessionId },
        data: {
          isVerified: false,
          expiresAt: new Date(),
        },
      });
    }
    
    await this.redis.del(`session:${sessionToken}`);
    return { success: true };
  }
}

