import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MailService } from '../mail/mail.service';
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
    if (!this.AIRTABLE_API_KEY) {
      throw new HttpException(
        'Server configuration error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!email || !email.trim()) {
      throw new HttpException(
        'Email is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!this.isValidEmail(email)) {
      throw new HttpException(
        'Please enter a valid email address',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      console.log('Adding email to Email table:', email);
      const response = await fetch(
        `https://api.airtable.com/v0/${this.BASE_ID}/${this.EMAIL_TABLE_ID}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            records: [
              {
                fields: {
                  Email: email,
                },
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Airtable API error:', errorData);
        throw new HttpException(
          'Failed to save email',
          response.status || HttpStatus.BAD_REQUEST,
        );
      }

      const data = await response.json();
      console.log('Successfully added email to Email table:', data.records[0].id);
    } catch (error) {
      console.error('Error saving email:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
    console.log('====================================');
    console.log('=== COMPLETE RSVP CALLED ===');
    console.log(`Email: ${data.email}`);
    console.log(`ReferralCode: ${data.referralCode}`);
    console.log('====================================');
    
    if (!this.AIRTABLE_API_KEY) {
      throw new HttpException(
        'Server configuration error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      throw new HttpException(
        'Valid email is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const age = this.calculateAge(data.birthday);
    if (isNaN(age) || age < 0) {
      throw new HttpException(
        'Invalid birthday format',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (age >= 19) {
      throw new HttpException(
        'Midnight is for teenagers 18 and under. You must be 18 or younger to attend.',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      console.log('Checking for existing RSVP with email:', data.email);
      const filterFormula = `{fldZCDn3M5M2F6AOX}="${data.email}"`;
      const searchUrl = `https://api.airtable.com/v0/${this.BASE_ID}/${this.TABLE_NAME}?filterByFormula=${encodeURIComponent(filterFormula)}`;
      
      const searchResponse = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.AIRTABLE_API_KEY}`,
        },
      });

      if (!searchResponse.ok) {
        const errorData = await searchResponse.json().catch(() => ({}));
        console.error('Airtable search error:', errorData);
        throw new HttpException(
          'Failed to check existing RSVPs',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const searchData = await searchResponse.json();
      
      if (searchData.records && searchData.records.length > 1) {
        console.warn(`Multiple RSVP records found for email: ${data.email}. Count: ${searchData.records.length}`);
      }
      
      if (searchData.records && searchData.records.length > 0) {
        console.log('=== EXISTING RECORD FOUND, UPDATING ===');
        const existingRecord = searchData.records[0];
        console.log('Existing record ID:', existingRecord.id);
        const fields = existingRecord.fields;
        
        const hasFirstName = fields['First Name'] && fields['First Name'].trim() !== '';
        const hasLastName = fields['Last Name'] && fields['Last Name'].trim() !== '';
        const hasBirthday = fields['Birthday'] && fields['Birthday'].trim() !== '';
        
        if (hasFirstName && hasLastName && hasBirthday) {
          console.log('Duplicate RSVP attempt detected for email:', data.email);
          throw new HttpException(
            'You can not RSVP at this time.',
            HttpStatus.BAD_REQUEST,
          );
        }
        
        console.log('=== UPDATING INCOMPLETE RSVP RECORD ===');
        console.log('Record ID:', existingRecord.id);
        const updateFields: any = {
          fldLfzvf3xvXnLeIr: data.firstName,
          fldfOBSrsWih4oHe6: data.lastName,
          fldsYVJC0EpDMiSgY: data.birthday,
          fldRmDEgOgxdjLcpR: clientIP,
        };
        console.log('Update fields:', JSON.stringify(updateFields, null, 2));
        
        if (data.referralCode) {
          const parsedCode = parseInt(data.referralCode, 10);
          if (!isNaN(parsedCode)) {
            updateFields.fldsx18FJRxEA19do = parsedCode;
          }
        }
        
        const updateResponse = await fetch(
          `https://api.airtable.com/v0/${this.BASE_ID}/${this.TABLE_NAME}/${existingRecord.id}`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${this.AIRTABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fields: updateFields,
            }),
          },
        );

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          console.error('Airtable update error:', errorData);
          throw new HttpException(
            'Failed to update RSVP',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        const updateData = await updateResponse.json();
        console.log('=== UPDATE RESPONSE DEBUG ===');
        console.log('Full updateData:', JSON.stringify(updateData, null, 2));
        console.log('updateData.fields:', JSON.stringify(updateData.fields, null, 2));
        console.log('Checking field by name:', updateData.fields?.['Loops - midnightRafflePosition']);
        console.log('All field keys:', Object.keys(updateData.fields || {}));
        let rafflePosition = updateData.fields?.['Loops - midnightRafflePosition'] || 0;
        
        if (!rafflePosition || rafflePosition === 0) {
          console.log('Raffle position not in update response, fetching record again...');
          const fetchResponse = await fetch(
            `https://api.airtable.com/v0/${this.BASE_ID}/${this.TABLE_NAME}/${existingRecord.id}`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${this.AIRTABLE_API_KEY}`,
              },
            },
          );
          if (fetchResponse.ok) {
            const fetchData = await fetchResponse.json();
            console.log('Fetched record fields:', JSON.stringify(fetchData.fields, null, 2));
            rafflePosition = fetchData.fields?.['Loops - midnightRafflePosition'] || 0;
            console.log('Raffle position from fetch:', rafflePosition);
          }
        }
        
        console.log('Successfully updated RSVP:', existingRecord.id, 'Raffle Position:', rafflePosition);
        
        this.sendRsvpEmailInBackground(data.email, rafflePosition).catch(error => {
          console.error('Background email send failed:', error);
        });

        return { rafflePosition };
      }

      console.log('=== NO EXISTING RECORD, CREATING NEW RSVP ===');
      console.log('Email:', data.email);
      const createFields: any = {
        fldZCDn3M5M2F6AOX: data.email,
        fldLfzvf3xvXnLeIr: data.firstName,
        fldfOBSrsWih4oHe6: data.lastName,
        fldsYVJC0EpDMiSgY: data.birthday,
        fldRmDEgOgxdjLcpR: clientIP,
      };
      console.log('Create fields:', JSON.stringify(createFields, null, 2));
      
      if (data.referralCode) {
        const parsedCode = parseInt(data.referralCode, 10);
        if (!isNaN(parsedCode)) {
          createFields.fldsx18FJRxEA19do = parsedCode;
        }
      }
      
      const createResponse = await fetch(
        `https://api.airtable.com/v0/${this.BASE_ID}/${this.TABLE_NAME}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            records: [
              {
                fields: createFields,
              },
            ],
          }),
        },
      );

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        console.error('Airtable API error:', errorData);
        throw new HttpException(
          'Failed to create RSVP',
          createResponse.status || HttpStatus.BAD_REQUEST,
        );
      }

      const createData = await createResponse.json();
      const recordId = createData.records[0].id;
      console.log('=== CREATE RESPONSE DEBUG ===');
      console.log('Full createData:', JSON.stringify(createData, null, 2));
      console.log('createData.records[0].fields:', JSON.stringify(createData.records[0].fields, null, 2));
      console.log('Checking field by name:', createData.records[0].fields?.['Loops - midnightRafflePosition']);
      console.log('All field keys:', Object.keys(createData.records[0].fields || {}));
      let rafflePosition = createData.records[0].fields?.['Loops - midnightRafflePosition'] || 0;
      
      if (!rafflePosition || rafflePosition === 0) {
        console.log('Raffle position not in create response, fetching record again...');
        const fetchResponse = await fetch(
          `https://api.airtable.com/v0/${this.BASE_ID}/${this.TABLE_NAME}/${recordId}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${this.AIRTABLE_API_KEY}`,
            },
          },
        );
        if (fetchResponse.ok) {
          const fetchData = await fetchResponse.json();
          console.log('Fetched record fields:', JSON.stringify(fetchData.fields, null, 2));
          rafflePosition = fetchData.fields?.['Loops - midnightRafflePosition'] || 0;
          console.log('Raffle position from fetch:', rafflePosition);
        }
      }
      
      console.log('Successfully created RSVP:', recordId, 'Raffle Position:', rafflePosition);
      
      this.sendRsvpEmailInBackground(data.email, rafflePosition).catch(error => {
        console.error('Background email send failed:', error);
      });
        
      return { rafflePosition };
      } catch (error) {
        console.error('Error completing RSVP:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getRsvpCount(): Promise<{ count: number }> {
    if (!this.AIRTABLE_API_KEY) {
      throw new HttpException(
        'Server configuration error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      let totalCount = 0;
      let offset: string | undefined;
      
      do {
        const url = offset 
          ? `https://api.airtable.com/v0/${this.BASE_ID}/${this.TABLE_NAME}?pageSize=100&offset=${offset}`
          : `https://api.airtable.com/v0/${this.BASE_ID}/${this.TABLE_NAME}?pageSize=100`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.AIRTABLE_API_KEY}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Airtable count error:', errorData);
          throw new HttpException(
            'Failed to fetch RSVP count',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        const data = await response.json();
        totalCount += data.records?.length || 0;
        offset = data.offset;
      } while (offset);
      
      return { count: totalCount };
    } catch (error) {
      console.error('Error fetching RSVP count:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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

  getHealth() {
    return { status: 'ok', service: 'user-service' };
  }
}
