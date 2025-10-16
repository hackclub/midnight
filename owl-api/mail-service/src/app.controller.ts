import { Controller, Get, Post, Body, HttpCode } from '@nestjs/common';
import { AppService } from './app.service';
import { SendEmailDto } from './dto/send-email.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/send-rsvp-email')
  @HttpCode(200)
  async sendRsvpEmail(@Body() body: SendEmailDto) {
    return await this.appService.sendRsvpEmail(body.email);
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
