import { Controller, Post, Get, Put, Body, Req, Res, HttpCode, UseGuards, Param, BadRequestException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UserService } from './user.service';
import { InitialRsvpDto } from './dto/initial-rsvp.dto';
import { CompleteRsvpDto } from './dto/complete-rsvp.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/auth.guard';
import * as express from 'express';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

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

    await this.userService.createInitialRsvp(body.email, clientIP);
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

    const result = await this.userService.completeRsvp(body, clientIP);
    return { success: true, rafflePosition: result.rafflePosition };
  }

  @Get('/rsvp/count')
  @HttpCode(200)
  async getRsvpCount() {
    return await this.userService.getRsvpCount();
  }

  @Get('/api/user/rsvp/count')
  @HttpCode(200)
  async getRsvpCountWithPrefix() {
    return await this.userService.getRsvpCount();
  }

  @Post('/api/user/rsvp/initial')
  @HttpCode(200)
  async createInitialRsvpWithPrefix(
    @Body() body: InitialRsvpDto,
    @Req() req: express.Request,
  ) {
    const forwardedFor = req.headers['x-forwarded-for'] as string;
    const clientIP = forwardedFor
      ? forwardedFor.split(',')[0].trim()
      : req.ip || req.socket.remoteAddress || 'unknown';

    await this.userService.createInitialRsvp(body.email, clientIP);
    return { success: true };
  }

  @Get('/api/user/rsvp/check-session')
  @HttpCode(200)
  checkSessionWithPrefix() {
    return { hasSession: true };
  }

  @Post('/api/user/rsvp/complete')
  @HttpCode(200)
  async completeRsvpWithPrefix(
    @Body() body: CompleteRsvpDto,
    @Req() req: express.Request,
  ) {
    const forwardedFor = req.headers['x-forwarded-for'] as string;
    const clientIP = forwardedFor
      ? forwardedFor.split(',')[0].trim()
      : req.ip || req.socket.remoteAddress || 'unknown';

    const result = await this.userService.completeRsvp(body, clientIP);
    return { success: true, rafflePosition: result.rafflePosition };
  }

  @Post('/sticker-token/verify')
  @HttpCode(200)
  async verifyStickerToken(@Body() body: { token: string }) {
    return await this.userService.verifyStickerToken(body.token);
  }

  @Post('/api/user/sticker-token/verify')
  @HttpCode(200)
  async verifyStickerTokenWithPrefix(@Body() body: { token: string }) {
    return await this.userService.verifyStickerToken(body.token);
  }

  @Get()
  getHealth() {
    return this.userService.getHealth();
  }

  @Post('api/user')
  @HttpCode(201)
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Put('api/user')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async updateUser(@Body() updateUserDto: UpdateUserDto, @Req() req: express.Request) {
    const userId = req.user.userId;
    return this.userService.updateUser(userId, updateUserDto);
  }

  @Get('api/user/hackatime-projects/unlinked')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async getHackatimeProjects(@Req() req: express.Request) {
    const userEmail = req.user.email;
    return this.userService.getUnlinkedHackatimeProjects(userEmail);
  }

  @Get('api/user/hackatime-projects/linked/:id')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async getHackatimeProject(@Param('id') id: string, @Req() req: express.Request) {
    const userEmail = req.user.email;
    const projectId = parseInt(id);

    if (isNaN(projectId)) {
      throw new BadRequestException('Invalid project ID');
    }

    return this.userService.getLinkedHackatimeProjects(userEmail, projectId);
  }

  @Get('api/user/hackatime-projects/all')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async getAllHackatimeProjects(@Req() req: express.Request) {
    const userEmail = req.user.email;
    return this.userService.getAllHackatimeProjects(userEmail);
  }

  @Get('api/user/projects/now-hackatime-hours/total')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async getTotalNowHackatimeHours(@Req() req: express.Request) {
    const userId = req.user.userId;
    const total = await this.userService.getTotalNowHackatimeHours(userId);
    return { totalNowHackatimeHours: total };
  }

  @Get('api/user/projects/approved-hours/total')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async getTotalApprovedHours(@Req() req: express.Request) {
    const userId = req.user.userId;
    const total = await this.userService.getTotalApprovedHours(userId);
    return { totalApprovedHours: total };
  }

  @Post('api/user/projects/now-hackatime-hours/recalculate')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async recalculateNowHackatimeHours(@Req() req: express.Request) {
    const userId = req.user.userId;
    return this.userService.recalculateNowHackatimeHours(userId);
  }

  @Get('api/user/hackatime-account')
  @UseGuards(AuthGuard)
  @Throttle({ default: { ttl: 3600000, limit: 1000000 } }) 
  @HttpCode(200)
  async checkHackatimeAccount(@Req() req: express.Request) {
    const userEmail = req.user.email;
    return this.userService.checkHackatimeAccountStatus(userEmail);
  }
}
