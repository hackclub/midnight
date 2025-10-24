import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class AirtableService {
  private readonly BASE_ID = 'appsibjo37dhUSTQp';
  private readonly YSWS_TABLE_ID = 'tblZEEoz2V2kFJHIk';
  private readonly AIRTABLE_API_KEY = process.env.USER_SERVICE_AIRTABLE_API_KEY;

  async createYSWSSubmission(data: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
      birthday: Date;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      country: string;
      zipCode: string;
    };
    project: {
      projectTitle: string;
      description: string;
      playableUrl: string;
      repoUrl: string;
      screenshotUrl: string;
      nowHackatimeHours: number;
    };
    submission: {
      description: string;
      playableUrl: string;
      repoUrl: string;
      screenshotUrl: string;
    };
  }): Promise<{ recordId: string }> {
    if (!this.AIRTABLE_API_KEY) {
      throw new HttpException(
        'Airtable API key not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const fields = {
        'First Name': data.user.firstName,
        'Last Name': data.user.lastName,
        'Email': data.user.email,
        'Birthday': data.user.birthday.toISOString().split('T')[0],
        'Address (Line 1)': data.user.addressLine1,
        'Address (Line 2)': data.user.addressLine2 || '',
        'City': data.user.city,
        'State / Province': data.user.state,
        'Country': data.user.country,
        'ZIP / Postal Code': data.user.zipCode,
        'Code URL': data.project.repoUrl,
        'Playable URL': data.project.playableUrl,
        'Description': data.project.description,
        'Screenshot': [
          {
            url: data.project.screenshotUrl,
            filename: `screenshot-${Date.now()}.png`
          }
        ],
        'Optional - Override Hours Spent': data.project.nowHackatimeHours,
        'Automation - First Submitted At': new Date().toISOString(),
        'Automation - Submit to Unified YSWS': true,
      };

      const response = await fetch(
        `https://api.airtable.com/v0/${this.BASE_ID}/${this.YSWS_TABLE_ID}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            records: [
              {
                fields,
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Airtable API error:', errorData);
        throw new HttpException(
          'Failed to create YSWS submission record',
          response.status || HttpStatus.BAD_REQUEST,
        );
      }

      const result = await response.json();
      return { recordId: result.records[0].id };
    } catch (error) {
      console.error('Error creating YSWS submission:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateYSWSSubmission(recordId: string, data: {
    approvedHours?: number;
    hoursJustification?: string;
    status?: string;
  }): Promise<void> {
    if (!this.AIRTABLE_API_KEY) {
      throw new HttpException(
        'Airtable API key not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const fields: any = {};
      
      if (data.approvedHours !== undefined) {
        fields['Optional - Override Hours Spent'] = data.approvedHours;
      }
      
      if (data.hoursJustification !== undefined) {
        fields['Optional - Override Hours Spent Justification'] = data.hoursJustification;
      }

      const response = await fetch(
        `https://api.airtable.com/v0/${this.BASE_ID}/${this.YSWS_TABLE_ID}/${recordId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${this.AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Airtable update error:', errorData);
        throw new HttpException(
          'Failed to update YSWS submission record',
          response.status || HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      console.error('Error updating YSWS submission:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
