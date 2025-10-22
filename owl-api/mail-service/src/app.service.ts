import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import mjml2html from 'mjml';
import { SmimeUtil, SmimeCertificate } from './utils/smime.util';
import * as forge from 'node-forge';
import { PrismaService } from './prisma.service';
import { JobLockService } from './job-lock.service';

@Injectable()
export class AppService {
  private transporter: nodemailer.Transporter;
  private emailTemplate: string;
  private stickerEmailTemplate: string;
  private smimeUtil: SmimeUtil | null = null;
  private smimeEnabled: boolean = false;

  constructor(
    private prisma: PrismaService,
    private jobLock: JobLockService,
  ) {
    const smtpHost = process.env.SMTP_HOST || `email-smtp.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER || process.env.AWS_SMTP_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.AWS_SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      throw new Error('SMTP credentials must be configured (SMTP_USER and SMTP_PASS or AWS_SMTP_USER and AWS_SMTP_PASS)');
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const mjmlTemplate = fs.readFileSync(
      path.join(__dirname, '../templates/rsvp-success.mjml'),
      'utf8',
    );
    const { html } = mjml2html(mjmlTemplate);
    this.emailTemplate = html;

    try {
      const stickerMjmlTemplate = fs.readFileSync(
        path.join(__dirname, '../templates/early-supporter-stickers.mjml'),
        'utf8',
      );
      const stickerHtml = mjml2html(stickerMjmlTemplate);
      this.stickerEmailTemplate = stickerHtml.html;
      console.log('Loaded sticker email template successfully');
    } catch (error) {
      console.error('Error loading sticker email template:', error);
      this.stickerEmailTemplate = this.emailTemplate;
    }

    this.initializeSmime();
    this.startEmailScheduler();
  }

  private startEmailScheduler() {
    setInterval(async () => {
      try {
        await this.processScheduledEmails();
      } catch (error) {
        console.error('Error in email scheduler:', error);
      }
    }, 60000);
    console.log('Email scheduler started - checking every minute');
  }

  private initializeSmime() {
    try {
      const smimePrivateKeyPath = process.env.SMIME_PRIVATE_KEY_PATH;
      const smimeCertPath = process.env.SMIME_CERT_PATH;
      const smimeChainPath = process.env.SMIME_CHAIN_PATH;

      if (smimePrivateKeyPath && smimeCertPath) {
        const certData: SmimeCertificate = {
          privateKey: this.loadCertContent(smimePrivateKeyPath),
          certificate: this.loadCertContent(smimeCertPath),
          chain: smimeChainPath 
            ? [this.loadCertContent(smimeChainPath)]
            : undefined,
        };

        this.smimeUtil = new SmimeUtil(certData);
        this.smimeEnabled = true;
        console.log('S/MIME encryption enabled');
      } else {
        console.log('S/MIME not configured, sending emails without encryption');
      }
    } catch (error) {
      console.error('Error initializing S/MIME:', error);
      console.log('Falling back to unencrypted email');
    }
  }

  private loadCertContent(pathOrBase64: string): string {
    if (fs.existsSync(pathOrBase64)) {
      return fs.readFileSync(pathOrBase64, 'utf8');
    }
    
    try {
      return Buffer.from(pathOrBase64, 'base64').toString('utf8');
    } catch (error) {
      throw new Error(`Invalid certificate content: must be a valid file path or base64 encoded string`);
    }
  }

  private createMimeMessage(from: string, to: string, subject: string, htmlContent: string): string {
    const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    let message = `From: ${from}\r\n`;
    message += `To: ${to}\r\n`;
    message += `Subject: ${subject}\r\n`;
    message += `MIME-Version: 1.0\r\n`;
    message += `Content-Type: multipart/alternative; boundary="${boundary}"\r\n`;
    message += `Date: ${new Date().toUTCString()}\r\n`;
    message += `\r\n`;
    message += `This is a multi-part message in MIME format.\r\n`;
    message += `\r\n`;
    message += `--${boundary}\r\n`;
    message += `Content-Type: text/html; charset="UTF-8"\r\n`;
    message += `Content-Transfer-Encoding: quoted-printable\r\n`;
    message += `\r\n`;
    message += htmlContent.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
    message += `\r\n`;
    message += `--${boundary}--\r\n`;
    
    return message;
  }

  async sendRsvpEmail(email: string, rsvpNumber?: number, rafflePosition?: number, stickerToken?: string): Promise<{ success: boolean }> {
    console.log(`sendRsvpEmail called with: email=${email}, rsvpNumber=${rsvpNumber}, rafflePosition=${rafflePosition}, stickerToken=${stickerToken ? 'present' : 'null'}`);
    
    await this.sendImmediateEmail(email, this.emailTemplate, 'To my dear nibbling...', {
      smimeEnabled: this.smimeEnabled,
      type: 'rsvp-confirmation',
    });

    console.log(`Checking sticker email conditions: rsvpNumber=${!!rsvpNumber}, rsvpNumber<=5000=${rsvpNumber ? rsvpNumber <= 5000 : 'N/A'}`);
    
    if (rsvpNumber && rsvpNumber <= 5000) {
      const scheduledFor = new Date();
      scheduledFor.setMinutes(scheduledFor.getMinutes() + 5);
      
      const stickerUrl = stickerToken 
        ? `https://forms.hackclub.com/midnight-stickers?owl_tkn=${stickerToken}`
        : `https://forms.hackclub.com/midnight-stickers`;
      const referralLink = rafflePosition !== undefined && rafflePosition !== null
        ? `https://midnight.hackclub.com/?ref=${rafflePosition}`
        : `https://midnight.hackclub.com/`;
      const emailContent = this.stickerEmailTemplate
        .replace(/{{rsvpNumber}}/g, rsvpNumber.toString())
        .replace(/{{stickerUrl}}/g, stickerUrl)
        .replace(/{{referralLink}}/g, referralLink);

      await this.scheduleEmail(email, emailContent, 'Midnight + Free Framework 12 Laptop', scheduledFor, {
        smimeEnabled: this.smimeEnabled,
        rsvpNumber,
        rafflePosition,
        stickerToken,
        type: 'early-supporter-stickers',
      });
    } else {
      console.log(`Sticker email NOT scheduled. Reason: rsvpNumber=${rsvpNumber || 'MISSING'}, rsvpNumber<=5000=${rsvpNumber ? (rsvpNumber <= 5000 ? 'YES' : `NO (${rsvpNumber})`) : 'N/A'}`);
    }

    return { success: true };
  }

  async sendImmediateEmail(email: string, htmlContent: string, subject: string, metadata: any = {}): Promise<{ success: boolean }> {
    const fromEmail = process.env.EMAIL_FROM || 'noreply@midnight.hackclub.com';
    const from = `Midnight (Hack Club) <${fromEmail}>`;

    const emailJob = await this.prisma.emailJob.create({
      data: {
        recipientEmail: email,
        subject,
        status: 'pending',
        metadata: {
          from: fromEmail,
          ...metadata,
        },
      },
    });

    try {
      if (this.smimeEnabled && this.smimeUtil) {
        const htmlBoundary = `----=_Part_HTML_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const signedBoundary = `----=_Part_Signed_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        let htmlPart = `Content-Type: text/html; charset="UTF-8"\r\n`;
        htmlPart += `Content-Transfer-Encoding: 7bit\r\n`;
        htmlPart += `\r\n`;
        htmlPart += htmlContent.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
        
        const signature = this.smimeUtil.createDetachedSignature(htmlPart);
        const base64Lines = signature.match(/.{1,76}/g) || [];
        
        let message = `From: ${from}\r\n`;
        message += `To: ${email}\r\n`;
        message += `Subject: ${subject}\r\n`;
        message += `MIME-Version: 1.0\r\n`;
        message += `Content-Type: multipart/signed; protocol="application/pkcs7-signature"; micalg="sha-256"; boundary="${signedBoundary}"\r\n`;
        message += `\r\n`;
        message += `This is a cryptographically signed message in MIME format.\r\n`;
        message += `\r\n`;
        message += `--${signedBoundary}\r\n`;
        message += htmlPart;
        message += `\r\n`;
        message += `--${signedBoundary}\r\n`;
        message += `Content-Type: application/pkcs7-signature; name="smime.p7s"\r\n`;
        message += `Content-Transfer-Encoding: base64\r\n`;
        message += `Content-Disposition: attachment; filename="smime.p7s"\r\n`;
        message += `\r\n`;
        message += base64Lines.join('\r\n');
        message += `\r\n`;
        message += `--${signedBoundary}--\r\n`;

        const mailResult = await this.transporter.sendMail({
          envelope: {
            from: from,
            to: email,
          },
          raw: message,
        });

        console.log('Successfully sent S/MIME signed email to:', email);
        
        await this.prisma.emailJob.update({
          where: { id: emailJob.id },
          data: {
            status: 'sent',
            sentAt: new Date(),
            metadata: {
              from: fromEmail,
              smimeEnabled: this.smimeEnabled,
              messageId: mailResult.messageId,
            },
          },
        });
      } else {
        const info = await this.transporter.sendMail({
          from: from,
          to: email,
          subject: subject,
          html: htmlContent,
        });

        console.log('Successfully sent email via SMTP:', info.messageId);
        
        await this.prisma.emailJob.update({
          where: { id: emailJob.id },
          data: {
            status: 'sent',
            sentAt: new Date(),
            metadata: {
              from: fromEmail,
              smimeEnabled: this.smimeEnabled,
              messageId: info.messageId,
            },
          },
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      
      await this.prisma.emailJob.update({
        where: { id: emailJob.id },
        data: {
          status: 'failed',
          failedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to send email via SMTP',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async scheduleEmail(email: string, htmlContent: string, subject: string, scheduledFor: Date, metadata: any = {}): Promise<{ success: boolean; jobId: string }> {
    const fromEmail = process.env.EMAIL_FROM || 'noreply@midnight.hackclub.com';
    
    const emailJob = await this.prisma.emailJob.create({
      data: {
        recipientEmail: email,
        subject,
        status: 'scheduled',
        scheduledFor,
        metadata: {
          from: fromEmail,
          htmlContent,
          ...metadata,
        },
      },
    });

    console.log(`Scheduled email for ${email} at ${scheduledFor.toISOString()}, job ID: ${emailJob.id}`);

    return { success: true, jobId: emailJob.id };
  }

  async processScheduledEmails(): Promise<void> {
    const availableJobs = await this.jobLock.getAvailableJobs(50);
    
    console.log(`[${this.jobLock.getWorkerId()}] Found ${availableJobs.length} available email job(s)`);

    let processed = 0;
    for (const job of availableJobs) {
      const lockAcquired = await this.jobLock.acquireJobLock(job.id);
      
      if (!lockAcquired) {
        console.log(`[${this.jobLock.getWorkerId()}] Failed to acquire lock for job ${job.id}, skipping`);
        continue;
      }

      processed++;
      console.log(`[${this.jobLock.getWorkerId()}] Processing job ${job.id} (${processed}/${availableJobs.length})`);

      try {
        await this.jobLock.markJobProcessing(job.id);

        const metadata = job.metadata as any;
        const htmlContent = metadata.htmlContent || this.emailTemplate;
        
        const fromEmail = process.env.EMAIL_FROM || 'noreply@midnight.hackclub.com';
        const from = `Midnight (Hack Club) <${fromEmail}>`;

        if (this.smimeEnabled && this.smimeUtil) {
          let htmlPart = `Content-Type: text/html; charset="UTF-8"\r\n`;
          htmlPart += `Content-Transfer-Encoding: 7bit\r\n`;
          htmlPart += `\r\n`;
          htmlPart += htmlContent.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
          
          const signature = this.smimeUtil.createDetachedSignature(htmlPart);
          const base64Lines = signature.match(/.{1,76}/g) || [];
          
          const signedBoundary = `----=_Part_Signed_${Date.now()}_${Math.random().toString(36).substring(7)}`;
          
          let message = `From: ${from}\r\n`;
          message += `To: ${job.recipientEmail}\r\n`;
          message += `Subject: ${job.subject}\r\n`;
          message += `MIME-Version: 1.0\r\n`;
          message += `Content-Type: multipart/signed; protocol="application/pkcs7-signature"; micalg="sha-256"; boundary="${signedBoundary}"\r\n`;
          message += `\r\n`;
          message += `This is a cryptographically signed message in MIME format.\r\n`;
          message += `\r\n`;
          message += `--${signedBoundary}\r\n`;
          message += htmlPart;
          message += `\r\n`;
          message += `--${signedBoundary}\r\n`;
          message += `Content-Type: application/pkcs7-signature; name="smime.p7s"\r\n`;
          message += `Content-Transfer-Encoding: base64\r\n`;
          message += `Content-Disposition: attachment; filename="smime.p7s"\r\n`;
          message += `\r\n`;
          message += base64Lines.join('\r\n');
          message += `\r\n`;
          message += `--${signedBoundary}--\r\n`;

          await this.transporter.sendMail({
            envelope: {
              from: from,
              to: job.recipientEmail,
            },
            raw: message,
          });
        } else {
          await this.transporter.sendMail({
            from: from,
            to: job.recipientEmail,
            subject: job.subject,
            html: htmlContent,
          });
        }

        await this.jobLock.markJobSent(job.id);
        await this.jobLock.releaseJobLock(job.id);

        console.log(`[${this.jobLock.getWorkerId()}] Successfully sent email to: ${job.recipientEmail}`);
      } catch (error) {
        console.error(`[${this.jobLock.getWorkerId()}] Error sending email to ${job.recipientEmail}:`, error);
        
        await this.jobLock.markJobFailed(
          job.id,
          error instanceof Error ? error.message : 'Unknown error'
        );
        await this.jobLock.releaseJobLock(job.id);
      }
    }

    console.log(`[${this.jobLock.getWorkerId()}] Processed ${processed} email job(s)`);
  }

  getHello(): string {
    return 'Hello World!';
  }
}
