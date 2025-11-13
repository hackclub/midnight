import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class UserService {
  private readonly BASE_ID = 'appumOs6hlFGhbv7c';
  private readonly TABLE_NAME = 'tbldJ8CL1xt7qcnrM';
  private readonly EMAIL_TABLE_ID = 'tblFDNhax22eAjSB3';
  private readonly AIRTABLE_API_KEY = process.env.USER_SERVICE_AIRTABLE_API_KEY;

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async generateUniqueToken(): Promise<string> {
    let token: string;
    let exists = true;
    
    while (exists) {
      token = randomBytes(32).toString('hex');
      const existingToken = await this.prisma.stickerToken.findUnique({
        where: { token },
      });
      exists = !!existingToken;
    }
    
    return token;
  }

  private async sendRsvpEmailInBackground(email: string, rafflePosition: number): Promise<void> {
    try {
      console.log(`=== SENDING EMAIL IN BACKGROUND ===`);
      console.log(`Email: ${email}, RafflePosition received: ${rafflePosition}`);
      
      let stickerToken: string | null = null;
      
      if (rafflePosition <= 5000) {
        const existingToken = await this.prisma.stickerToken.findFirst({
          where: { email },
        });
        
        if (!existingToken) {
          const token = await this.generateUniqueToken();
          await this.prisma.stickerToken.create({
            data: {
              email,
              token,
              rsvpNumber: rafflePosition,
            },
          });
          stickerToken = token;
        } else {
          stickerToken = existingToken.token;
        }
      }
      
      console.log(`Calling mail service directly with:`, {
        email,
        rsvpNumber: rafflePosition,
        rafflePosition,
        stickerToken,
      });
      
      await this.mailService.sendRsvpEmail(
        email,
        rafflePosition,
        rafflePosition,
        stickerToken
      );
      
      console.log('Successfully sent RSVP confirmation email in background');
    } catch (error) {
      console.error('Error in background email send:', error);
    }
  }

  async createInitialRsvp(email: string, clientIP: string): Promise<void> {
    throw new HttpException(
      'rsvp is not enabled at this moment',
      HttpStatus.BAD_REQUEST,
    );
  }

  private calculateAge(birthday: string): number {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  async completeRsvp(
    data: { email: string; firstName: string; lastName: string; birthday: string; referralCode?: string },
    clientIP: string,
  ): Promise<{ rafflePosition: number }> {
    throw new HttpException(
      'rsvp is not enabled at this moment',
      HttpStatus.BAD_REQUEST,
    );
  }

  async getRsvpCount(): Promise<{ count: number }> {
    return { count: 0 };
  }

  async verifyStickerToken(token: string): Promise<{ valid: boolean; email?: string; rsvpNumber?: number }> {
    if (!token) {
      throw new HttpException(
        'Token is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const stickerToken = await this.prisma.stickerToken.findUnique({
        where: { token },
      });

      if (!stickerToken) {
        return { valid: false };
      }

      if (stickerToken.isUsed) {
        return { valid: false };
      }

      await this.prisma.stickerToken.update({
        where: { token },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      });

      return {
        valid: true,
        email: stickerToken.email,
        rsvpNumber: stickerToken.rsvpNumber,
      };
    } catch (error) {
      console.error('Error verifying sticker token:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createUser(createUserDto: CreateUserDto) {
    const { email, firstName, lastName } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new HttpException(
        'User with this email already exists',
        HttpStatus.CONFLICT,
      );
    }

    let finalFirstName = firstName;
    let finalLastName = lastName;
    let rafflePos: string | null = null;
    let finalBirthday = new Date('2000-01-01');

    try {
      const airtableUser = await this.prisma.$queryRaw<Array<{
        first_name: string;
        last_name: string;
        code: string;
        birthday: Date;
      }>>`
        SELECT first_name, last_name, CAST(code AS TEXT) as code, birthday
        FROM users_airtable
        WHERE email = ${email}
        LIMIT 1
      `;

      if (airtableUser && airtableUser.length > 0) {
        finalFirstName = airtableUser[0].first_name;
        finalLastName = airtableUser[0].last_name;
        rafflePos = airtableUser[0].code || null;
        if (airtableUser[0].birthday) {
          finalBirthday = new Date(airtableUser[0].birthday);
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

    const user = await this.prisma.user.create({
      data: {
        email,
        firstName: finalFirstName,
        lastName: finalLastName,
        birthday: finalBirthday,
        rafflePos,
      },
    });

    return {
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
    };
  }

  async updateUser(userId: number, updateUserDto: UpdateUserDto) {
    const updateData: any = {};

    if (updateUserDto.firstName !== undefined) {
      updateData.firstName = updateUserDto.firstName;
    }
    if (updateUserDto.lastName !== undefined) {
      updateData.lastName = updateUserDto.lastName;
    }
    if (updateUserDto.birthday !== undefined) {
      updateData.birthday = new Date(updateUserDto.birthday);
    }
    if (updateUserDto.addressLine1 !== undefined) {
      updateData.addressLine1 = updateUserDto.addressLine1;
    }
    if (updateUserDto.addressLine2 !== undefined) {
      updateData.addressLine2 = updateUserDto.addressLine2;
    }
    if (updateUserDto.city !== undefined) {
      updateData.city = updateUserDto.city;
    }
    if (updateUserDto.state !== undefined) {
      updateData.state = updateUserDto.state;
    }
    if (updateUserDto.country !== undefined) {
      updateData.country = updateUserDto.country;
    }
    if (updateUserDto.zipCode !== undefined) {
      updateData.zipCode = updateUserDto.zipCode;
    }
    if (updateUserDto.airtableRecId !== undefined) {
      updateData.airtableRecId = updateUserDto.airtableRecId;
    }

    const user = await this.prisma.user.update({
      where: { userId },
      data: updateData,
    });

    return {
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      birthday: user.birthday,
      addressLine1: user.addressLine1,
      addressLine2: user.addressLine2,
      city: user.city,
      state: user.state,
      country: user.country,
      zipCode: user.zipCode,
      airtableRecId: user.airtableRecId,
      updatedAt: user.updatedAt,
    };
  }

  getHealth() {
    return { status: 'ok', service: 'user-service' };
  }

  async checkHackatimeAccountStatus(userEmail: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        userId: true,
        email: true,
        hackatimeAccount: true,
      },
    });

    if (!user) {
      throw new HttpException(
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Query hackatime database directly to check if account exists
    const hackatimeId = await this.checkHackatimeAccount(userEmail);
    
    // Update user's hackatime account if found and different from stored value
    if (hackatimeId && hackatimeId.toString() !== user.hackatimeAccount) {
      await this.prisma.user.update({
        where: { userId: user.userId },
        data: { hackatimeAccount: hackatimeId.toString() },
      });
    }

    return {
      email: user.email,
      hasHackatimeAccount: !!hackatimeId,
      hackatimeAccountId: hackatimeId?.toString() || null,
    };
  }

  private async checkHackatimeAccount(email: string): Promise<number | null> {
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

  async getHackatimeProjects(userEmail: string): Promise<any> {
    const HACKATIME_ADMIN_API_URL = process.env.HACKATIME_ADMIN_API_URL || 'https://hackatime.hackclub.com/api/admin/v1';
    const HACKATIME_API_KEY = process.env.HACKATIME_API_KEY;

    const user = await this.prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        projects: {
          select: {
            nowHackatimeProjects: true,
          },
        },
      },
    });

    if (!user) {
      throw new HttpException(
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (!user.hackatimeAccount) {
      throw new HttpException(
        'No Hackatime account linked to this user',
        HttpStatus.NOT_FOUND,
      );
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (HACKATIME_API_KEY) {
      headers['Authorization'] = `Bearer ${HACKATIME_API_KEY}`;
    }

    const res = await fetch(
      `${HACKATIME_ADMIN_API_URL}/user/projects?id=${user.hackatimeAccount}`,
      {
        method: 'GET',
        headers,
      },
    );

    if (!res.ok) {
      if (res.status === 404) {
        throw new HttpException(
          'Hackatime projects not found for this user',
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        'Failed to fetch hackatime projects',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const hackatimeProjects = await res.json();
    const linkedProjectNames = new Set<string>();
    
    user.projects.forEach(project => {
      if (project.nowHackatimeProjects) {
        project.nowHackatimeProjects.forEach(name => linkedProjectNames.add(name));
      }
    });

    if (Array.isArray(hackatimeProjects)) {
      return hackatimeProjects.filter((project: any) => 
        !linkedProjectNames.has(project.name || project.projectName || project)
      );
    }

    if (hackatimeProjects.projects && Array.isArray(hackatimeProjects.projects)) {
      return {
        ...hackatimeProjects,
        projects: hackatimeProjects.projects.filter((project: any) =>
          !linkedProjectNames.has(project.name || project.projectName || project)
        ),
      };
    }

    if (hackatimeProjects.name || hackatimeProjects.projectName) {
      const projectName = hackatimeProjects.name || hackatimeProjects.projectName;
      if (linkedProjectNames.has(projectName)) {
        throw new HttpException(
          'All hackatime projects are already linked',
          HttpStatus.NOT_FOUND,
        );
      }
    }

    return hackatimeProjects;
  }

  async getAllHackatimeProjects(userEmail: string): Promise<any> {
    const HACKATIME_ADMIN_API_URL = process.env.HACKATIME_ADMIN_API_URL || 'https://hackatime.hackclub.com/api/admin/v1';
    const HACKATIME_API_KEY = process.env.HACKATIME_API_KEY;

    const user = await this.prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      throw new HttpException(
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (!user.hackatimeAccount) {
      throw new HttpException(
        'No Hackatime account linked to this user',
        HttpStatus.NOT_FOUND,
      );
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (HACKATIME_API_KEY) {
      headers['Authorization'] = `Bearer ${HACKATIME_API_KEY}`;
    }

    const res = await fetch(
      `${HACKATIME_ADMIN_API_URL}/user/projects?id=${user.hackatimeAccount}`,
      {
        method: 'GET',
        headers,
      },
    );

    if (!res.ok) {
      if (res.status === 404) {
        throw new HttpException(
          'Hackatime projects not found for this user',
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        'Failed to fetch hackatime projects',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return res.json();
  }

  async getTotalNowHackatimeHours(userId: number): Promise<number> {
    const result = await this.prisma.project.aggregate({
      where: { userId },
      _sum: {
        nowHackatimeHours: true,
      },
    });
    return result._sum.nowHackatimeHours ?? 0;
  }

  async getTotalApprovedHours(userId: number): Promise<number> {
    const result = await this.prisma.project.aggregate({
      where: { userId },
      _sum: {
        approvedHours: true,
      },
    });
    return result._sum.approvedHours ?? 0;
  }

  async recalculateNowHackatimeHours(userId: number): Promise<{ updatedProjects: number; totalNowHackatimeHours: number }> {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: {
        hackatimeAccount: true,
        projects: {
          select: {
            projectId: true,
            nowHackatimeProjects: true,
          },
        },
      },
    });

    if (!user) {
      throw new HttpException(
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (!user.hackatimeAccount) {
      throw new HttpException(
        'No Hackatime account linked to this user',
        HttpStatus.NOT_FOUND,
      );
    }

    if (!user.projects || user.projects.length === 0) {
      return { updatedProjects: 0, totalNowHackatimeHours: 0 };
    }

    const baseUrl = process.env.HACKATIME_ADMIN_API_URL || 'https://hackatime.hackclub.com/api/admin/v1';
    const apiKey = process.env.HACKATIME_API_KEY;
    const { projectsMap } = await this.fetchHackatimeProjectsData(user.hackatimeAccount);

    await Promise.all(
      user.projects.map(async project => {
        const projectNames = project.nowHackatimeProjects || [];
        const totalHours = await this.calculateHackatimeHours(
          projectNames,
          projectsMap,
          user.hackatimeAccount,
          baseUrl,
          apiKey,
        );
        await this.prisma.project.update({
          where: { projectId: project.projectId },
          data: { nowHackatimeHours: totalHours },
        });
      }),
    );

    const totalNowHackatimeHours = await this.getTotalNowHackatimeHours(userId);

    return { updatedProjects: user.projects.length, totalNowHackatimeHours };
  }

  async getLinkedHackatimeProjects(userEmail: string, projectId: number): Promise<any> {
    const allProjects = await this.getAllHackatimeProjects(userEmail);

    const project = await this.prisma.project.findUnique({
      where: { projectId },
      select: {
        nowHackatimeProjects: true,
      },
    });

    if (!project) {
      throw new HttpException(
        'Project not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const linkedProjectNames = new Set<string>(project.nowHackatimeProjects || []);

    if (Array.isArray(allProjects)) {
      return allProjects.filter((project: any) => 
        linkedProjectNames.has(project.name || project.projectName || project)
      );
    }

    if (allProjects.projects && Array.isArray(allProjects.projects)) {
      return {
        ...allProjects,
        projects: allProjects.projects.filter((project: any) =>
          linkedProjectNames.has(project.name || project.projectName || project)
        ),
      };
    }

    if (allProjects.name || allProjects.projectName) {
      const projectName = allProjects.name || allProjects.projectName;
      if (linkedProjectNames.has(projectName)) {
        return allProjects;
      }
      return Array.isArray(allProjects) ? [] : { ...allProjects, projects: [] };
    }

    return allProjects;
  }

  async getUnlinkedHackatimeProjects(userEmail: string): Promise<any> {
    const allProjects = await this.getAllHackatimeProjects(userEmail);

    const user = await this.prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        projects: {
          select: {
            nowHackatimeProjects: true,
          },
        },
      },
    });

    if (!user) {
      throw new HttpException(
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const linkedProjectNames = new Set<string>();
    
    user.projects.forEach(project => {
      if (project.nowHackatimeProjects) {
        project.nowHackatimeProjects.forEach(name => linkedProjectNames.add(name));
      }
    });

    if (Array.isArray(allProjects)) {
      return allProjects.filter((project: any) => 
        !linkedProjectNames.has(project.name || project.projectName || project)
      );
    }

    if (allProjects.projects && Array.isArray(allProjects.projects)) {
      return {
        ...allProjects,
        projects: allProjects.projects.filter((project: any) =>
          !linkedProjectNames.has(project.name || project.projectName || project)
        ),
      };
    }

    if (allProjects.name || allProjects.projectName) {
      const projectName = allProjects.name || allProjects.projectName;
      if (linkedProjectNames.has(projectName)) {
        throw new HttpException(
          'All hackatime projects are already linked',
          HttpStatus.NOT_FOUND,
        );
      }
    }

    return allProjects;
  }

  private async fetchHackatimeProjectsData(hackatimeAccount: string) {
    const baseUrl = process.env.HACKATIME_ADMIN_API_URL || 'https://hackatime.hackclub.com/api/admin/v1';
    const apiKey = process.env.HACKATIME_API_KEY;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(`${baseUrl}/user/projects?id=${hackatimeAccount}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new HttpException(
        'Failed to fetch hackatime projects',
        HttpStatus.BAD_REQUEST,
      );
    }

    const rawData = await response.json();
    const projectsMap = new Map<string, number>();

    const addProject = (entry: any) => {
      if (typeof entry === 'string') {
        if (!projectsMap.has(entry)) {
          projectsMap.set(entry, 0);
        }
        return;
      }

      const name = entry?.name || entry?.projectName;

      if (typeof name === 'string') {
        const duration = typeof entry?.total_duration === 'number' ? entry.total_duration : 0;
        projectsMap.set(name, duration);
      }
    };

    if (Array.isArray(rawData)) {
      rawData.forEach(addProject);
    } else if (Array.isArray(rawData?.projects)) {
      rawData.projects.forEach(addProject);
    } else if (rawData?.name || rawData?.projectName) {
      addProject(rawData);
    }

    return { projectsMap };
  }

  private async fetchHackatimeProjectDurationsAfterDate(
    hackatimeAccount: string,
    projectNames: string[],
    baseUrl: string,
    apiKey?: string,
    cutoffDate: Date = new Date('2025-10-10T00:00:00Z'),
  ): Promise<Map<string, number>> {
    const startDate = cutoffDate.toISOString().split('T')[0];
    const uri = `https://hackatime.hackclub.com/api/v1/users/${hackatimeAccount}/stats?features=projects&start_date=${startDate}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const durationsMap = new Map<string, number>();

    for (const projectName of projectNames) {
      durationsMap.set(projectName, 0);
    }

    try {
      const response = await fetch(uri, {
        method: 'GET',
        headers,
      });

      if (response.ok) {
        const responseData = await response.json();
        const projects = responseData?.data?.projects;
        
        if (projects && Array.isArray(projects)) {
          for (const project of projects) {
            const name = project?.name;
            if (typeof name === 'string' && projectNames.includes(name)) {
              const duration = typeof project?.total_seconds === 'number' 
                ? project.total_seconds 
                : 0;
              durationsMap.set(name, duration);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching hackatime stats:', error);
    }

    return durationsMap;
  }

  private async calculateHackatimeHours(
    projectNames: string[],
    projectsMap: Map<string, number>,
    hackatimeAccount?: string,
    baseUrl?: string,
    apiKey?: string,
  ) {
    if (hackatimeAccount && baseUrl) {
      const cutoffDate = new Date('2025-10-10T00:00:00Z');
      const filteredDurations = await this.fetchHackatimeProjectDurationsAfterDate(
        hackatimeAccount,
        projectNames,
        baseUrl,
        apiKey,
        cutoffDate,
      );

      let totalSeconds = 0;
      for (const name of projectNames) {
        totalSeconds += filteredDurations.get(name) || 0;
      }

      return Math.round((totalSeconds / 3600) * 10) / 10;
    }

    let totalSeconds = 0;
    for (const name of projectNames) {
      totalSeconds += projectsMap.get(name) ?? 0;
    }

    return Math.round((totalSeconds / 3600) * 10) / 10;
  }
}
