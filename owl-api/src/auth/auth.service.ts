import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
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
    const { email, referralCode } = loginDto;
    
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      const hackatimeAccount = await this.checkHackatimeAccount(email);
      
      let firstName = 'Temporary';
      let lastName = 'User';
      let rafflePos: string | null = null;
      let birthday = new Date('2000-01-01');

      try {
        const airtableUser = await this.prisma.$queryRaw<Array<{
          first_name: string | null;
          last_name: string | null;
          code: string | null;
          birthday: Date | null;
        }>>`
          SELECT first_name, last_name, CAST(code AS TEXT) as code, birthday
          FROM users_airtable
          WHERE email = ${email}
          LIMIT 1
        `;

        if (airtableUser && airtableUser.length > 0) {
          firstName = airtableUser[0].first_name ?? firstName;
          lastName = airtableUser[0].last_name ?? lastName;
          rafflePos = airtableUser[0].code ?? null;
          if (airtableUser[0].birthday) {
            birthday = new Date(airtableUser[0].birthday);
          }
        } else {
          const maxUserCodeResult = await this.prisma.$queryRaw<Array<{
            max_code: string | null;
          }>>`
            SELECT CAST(MAX(CAST(raffle_pos AS INTEGER)) AS TEXT) as max_code
            FROM users
            WHERE raffle_pos IS NOT NULL AND raffle_pos ~ '^[0-9]+$'
          `;

          const maxAirtableCodeResult = await this.prisma.$queryRaw<Array<{
            max_code: string | null;
          }>>`
            SELECT CAST(MAX(code) AS TEXT) as max_code
            FROM users_airtable
          `;

          const maxUserCode = maxUserCodeResult && maxUserCodeResult.length > 0 && maxUserCodeResult[0].max_code
            ? parseInt(maxUserCodeResult[0].max_code, 10)
            : 0;

          const maxAirtableCode = maxAirtableCodeResult && maxAirtableCodeResult.length > 0 && maxAirtableCodeResult[0].max_code
            ? parseInt(maxAirtableCodeResult[0].max_code, 10)
            : 0;

          const maxCode = Math.max(maxUserCode, maxAirtableCode);
          rafflePos = (maxCode + 1).toString();
        }
      } catch (error) {
        console.error('Error checking users_airtable:', error);
      }
      
      existingUser = await this.prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          birthday,
          role: 'user',
          hackatimeAccount: hackatimeAccount?.toString() || null,
          referralCode: referralCode || null,
          rafflePos,
        },
      });
    } else {
      const updateData: any = {};
      if (referralCode && !existingUser.referralCode) {
        updateData.referralCode = referralCode;
      }
      
      if (Object.keys(updateData).length > 0) {
        existingUser = await this.prisma.user.update({
          where: { userId: existingUser.userId },
          data: updateData,
        });
      }
    }

    await this.prisma.userSession.deleteMany({
      where: { userId: existingUser.userId },
    });
    
    const session = await this.prisma.userSession.create({
      data: {
        userId: existingUser.userId,
        otpCode: otp,
        otpExpiresAt: expiresAt,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

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

    const user = session.user;
    
    if (!user) {
      throw new BadRequestException('User not found in session');
    }

    const isNewUser = !user.onboardComplete || user.firstName === 'Temporary';

    if (isNewUser) {
      return {
        message: 'OTP verified. Please complete your profile.',
        sessionId: session.id,
        isNewUser: true,
        email: user.email,
      };
    } else {
      if (this.calculateAge(user.birthday) >= 19) {
        throw new ForbiddenException('You must be under 19 to sign in.');
      }
      return {
        message: 'OTP verified successfully',
        isNewUser: false,
        user: {
          userId: user.userId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        sessionId: session.id,
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

    const defaultBirthday = new Date('2000-01-01');
    const isTemporaryUser = session.user.firstName === 'Temporary';
    const needsBirthday = session.user.birthday.getTime() === defaultBirthday.getTime();
    
    if (!isTemporaryUser && !needsBirthday) {
      throw new BadRequestException('User profile already completed');
    }

    const birthDate = new Date(birthday);
    if (Number.isNaN(birthDate.getTime())) {
      throw new BadRequestException('Invalid birthday');
    }
    if (this.calculateAge(birthDate) >= 19) {
      throw new ForbiddenException('You must be under 19 to participate.');
    }

    const updateData: any = {
      birthday: birthDate,
      addressLine1,
      addressLine2,
      city,
      state,
      country,
      zipCode,
      airtableRecId,
      onboardedAt: new Date(),
    };

    if (isTemporaryUser) {
      updateData.firstName = firstName;
      updateData.lastName = lastName;
    }

    const user = await this.prisma.user.update({
      where: { userId: session.user.userId },
      data: updateData,
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

  async getRafflePos(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: { rafflePos: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return { rafflePos: user.rafflePos };
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
      select: { 
        onboardComplete: true,
        firstName: true,
        lastName: true,
        birthday: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const defaultBirthday = new Date('2000-01-01');
    const needsBirthday = user.birthday.getTime() === defaultBirthday.getTime();
    const isTemporaryUser = user.firstName === 'Temporary';

    return {
      onboardComplete: user.onboardComplete,
      needsBirthday,
      isTemporaryUser,
      hasPrefilledData: !isTemporaryUser && !needsBirthday,
    };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async checkHackatimeAccount(email: string): Promise<number | null> {
    const HACKATIME_ADMIN_API_URL = process.env.HACKATIME_ADMIN_API_URL || 'https://hackatime.hackclub.com/api/admin/v1';
    const HACKATIME_API_KEY = process.env.HACKATIME_API_KEY;

    console.log('=== CHECKING HACKATIME ACCOUNT ===');
    console.log('Email:', email);
    console.log('API Key configured:', !!HACKATIME_API_KEY);
    console.log('API URL:', HACKATIME_ADMIN_API_URL);

    if (!HACKATIME_API_KEY) {
      console.warn('HACKATIME_API_KEY not configured, skipping Hackatime lookup');
      return null;
    }

    try {
      const sanitizedEmail = email.replace(/'/g, "''");
      
      const searchQuery = {
        query: `
          SELECT
            users.id,
            users.username,
            users.github_username,
            users.slack_username,
            email_addresses.email
          FROM
            users
            INNER JOIN email_addresses ON users.id = email_addresses.user_id
          WHERE
            email_addresses.email = '${sanitizedEmail}'
          LIMIT 1;
        `,
      };

      console.log('Sending query to Hackatime API...');

      const res = await fetch(`${HACKATIME_ADMIN_API_URL}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HACKATIME_API_KEY}`,
        },
        body: JSON.stringify(searchQuery),
      });

      console.log('Response status:', res.status);

      if (!res.ok) {
        console.error('Failed to check Hackatime account:', res.status);
        return null;
      }

      const data = await res.json();
      console.log('Response data:', JSON.stringify(data, null, 2));
      
      if (data.rows && data.rows.length > 0) {
        const hackatimeId = data.rows[0].id[1];
        console.log(`✓ Found Hackatime account for ${email}: ${hackatimeId}`);
        return hackatimeId;
      }

      console.log(`✗ No Hackatime account found for ${email}`);
      return null;
    } catch (error) {
      console.error('Error checking Hackatime account:', error);
      return null;
    }
  }

  async sendHackatimeLinkOtp(userId: number, email: string) {
    const user = await this.prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const hackatimeAccountId = await this.checkHackatimeAccount(email);

    if (!hackatimeAccountId) {
      throw new BadRequestException('No Hackatime account found with this email');
    }

    const linkedUser = await this.prisma.user.findFirst({
      where: {
        hackatimeAccount: hackatimeAccountId.toString(),
        NOT: { userId },
      },
      select: { userId: true },
    });

    if (linkedUser) {
      throw new BadRequestException('This Hackatime account is already linked to another user');
    }

    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const existingOtp = await this.prisma.hackatimeLinkOtp.findFirst({
      where: { userId },
    });

    if (existingOtp) {
      await this.prisma.hackatimeLinkOtp.delete({
        where: { id: existingOtp.id },
      });
    }

    await this.prisma.hackatimeLinkOtp.create({
      data: {
        userId,
        email,
        otpCode: otp,
        expiresAt,
      },
    });

    console.log('=== SENDING HACKATIME LINK OTP ===');
    console.log('Email:', email);
    console.log('OTP:', otp);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Link Your Hackatime Account</h2>
        <p>Your verification code is:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code expires in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `;

    console.log('Calling sendImmediateEmail with type: hackatime-link-otp');
    await this.mailService.sendImmediateEmail(
      email,
      htmlContent,
      'Link Your Hackatime Account',
      {
        type: 'hackatime-link-otp',
      }
    );
    console.log('Email sent successfully');

    return { message: 'Verification code sent to your email' };
  }

  async verifyHackatimeLinkOtp(userId: number, otp: string) {
    const otpRecord = await this.prisma.hackatimeLinkOtp.findFirst({
      where: {
        userId,
        otpCode: otp,
        expiresAt: { gt: new Date() },
        isUsed: false,
      },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    const hackatimeAccount = await this.checkHackatimeAccount(otpRecord.email);

    if (!hackatimeAccount) {
      throw new BadRequestException('No Hackatime account found with this email');
    }

    await this.prisma.user.update({
      where: { userId },
      data: {
        hackatimeAccount: hackatimeAccount.toString(),
      },
    });

    await this.prisma.hackatimeLinkOtp.update({
      where: { id: otpRecord.id },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });

    return {
      message: 'Hackatime account linked successfully',
      hackatimeAccountId: hackatimeAccount,
    };
  }

  private calculateAge(birthday: Date) {
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const monthDiff = today.getMonth() - birthday.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
      age -= 1;
    }
    return age;
  }
}
