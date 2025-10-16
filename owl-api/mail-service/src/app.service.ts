import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import mjml2html from 'mjml';
import { SmimeUtil, SmimeCertificate } from './utils/smime.util';
import * as forge from 'node-forge';

@Injectable()
export class AppService {
  private transporter: nodemailer.Transporter;
  private emailTemplate: string;
  private smimeUtil: SmimeUtil | null = null;
  private smimeEnabled: boolean = false;

  constructor() {
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

    this.initializeSmime();
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

  async sendRsvpEmail(email: string): Promise<{ success: boolean }> {
    try {
      const fromEmail = process.env.EMAIL_FROM || 'noreply@midnight.hackclub.com';
      const from = `Midnight (Hack Club) <${fromEmail}>`;
      const subject = 'To my dear nibbling...';

      if (this.smimeEnabled && this.smimeUtil) {
        const htmlBoundary = `----=_Part_HTML_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const signedBoundary = `----=_Part_Signed_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        let htmlPart = `Content-Type: text/html; charset="UTF-8"\r\n`;
        htmlPart += `Content-Transfer-Encoding: 7bit\r\n`;
        htmlPart += `\r\n`;
        htmlPart += this.emailTemplate.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
        
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

        await this.transporter.sendMail({
          envelope: {
            from: from,
            to: email,
          },
          raw: message,
        });

        console.log('Successfully sent S/MIME signed email to:', email);
      } else {
        const info = await this.transporter.sendMail({
          from: from,
          to: email,
          subject: subject,
          html: this.emailTemplate,
        });

        console.log('Successfully sent email via SMTP:', info.messageId);
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to send email via SMTP',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
