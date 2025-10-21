import { Controller, Post, Get, Body, Req, Res, HttpCode } from '@nestjs/common';
import { AppService } from './app.service';
import { InitialRsvpDto } from './dto/initial-rsvp.dto';
import { CompleteRsvpDto } from './dto/complete-rsvp.dto';
import * as express from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/rsvp/initial')
  @HttpCode(200)
  async createInitialRsvp(
    @Body() body: InitialRsvpDto,
    @Req() req: express.Request,
  ) {
    const forwardedFor = req.headers['x-forwarded-for'] as string;
    const clientIP = forwardedFor
      ? forwardedFor.split(',')[0].trim()
      : req.ip || req.socket.remoteAddress || 'unknown';

    await this.appService.createInitialRsvp(body.email, clientIP);
    return { success: true };
  }

  @Get('/rsvp/check-session')
  @HttpCode(200)
  checkSession() {
    return { hasSession: true };
  }

  @Post('/rsvp/complete')
  @HttpCode(200)
  async completeRsvp(
    @Body() body: CompleteRsvpDto,
    @Req() req: express.Request,
  ) {
    const forwardedFor = req.headers['x-forwarded-for'] as string;
    const clientIP = forwardedFor
      ? forwardedFor.split(',')[0].trim()
      : req.ip || req.socket.remoteAddress || 'unknown';

    const result = await this.appService.completeRsvp(body, clientIP);
    return { success: true, rafflePosition: result.rafflePosition };
  }

  @Get('/rsvp/count')
  @HttpCode(200)
  async getRsvpCount() {
    return await this.appService.getRsvpCount();
  }

  @Post('/sticker-token/verify')
  @HttpCode(200)
  async verifyStickerToken(@Body() body: { token: string }) {
    return await this.appService.verifyStickerToken(body.token);
  }

  @Get()
  getHealth() {
    return this.appService.getHealth();
  }
}
