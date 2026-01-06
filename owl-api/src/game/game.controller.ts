import { Controller, Post, Get, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { GameService } from './game.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api/game')
@UseGuards(AuthGuard)
export class GameController {
  constructor(private gameService: GameService) {}

  /**
   * Play a round of buckshot roulette, wagering ALL unspent hours.
   * 
   * @param req - The authenticated request containing user info
   * @returns The game result including win/loss and new balance
   */
  @Post('buckshot-roulette')
  async playBuckshotRoulette(@Req() req: Request) {
    return this.gameService.playBuckshotRoulette(req.user.userId);
  }

  /**
   * Get the user's buckshot roulette statistics.
   * 
   * @param req - The authenticated request containing user info
   * @returns Statistics about wins, losses, and net hours
   */
  @Get('buckshot-roulette/stats')
  async getGameStats(@Req() req: Request) {
    return this.gameService.getGameStats(req.user.userId);
  }
}
