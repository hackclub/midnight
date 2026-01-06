import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ShopService } from '../shop/shop.service';

/**
 * Game name used to identify buckshot roulette transactions in the shop system.
 * A shop item with this name must exist for transactions to be recorded.
 */
const BUCKSHOT_ROULETTE_ITEM_NAME = 'Buckshot Roulette';

/**
 * Buckshot roulette game configuration.
 * - 50/50 odds (win or lose)
 * - 2x payout on win (wager amount returned + equal winnings)
 * - User wagers ALL unspent project hours (no choice)
 */
const GAME_CONFIG = {
  WIN_PROBABILITY: 0.5,
  PAYOUT_MULTIPLIER: 2,
  MIN_BALANCE_TO_PLAY: 0.1,
};

export interface GameResult {
  won: boolean;
  wager: number;
  payout: number;
  newBalance: number;
  message: string;
}

@Injectable()
export class GameService {
  constructor(
    private prisma: PrismaService,
    private shopService: ShopService,
  ) {}

  /**
   * Plays a round of buckshot roulette, wagering ALL unspent hours.
   * 
   * @param userId - The ID of the user playing
   * @returns The result of the game including win/loss status and new balance
   * @throws BadRequestException if user has insufficient balance to play
   */
  async playBuckshotRoulette(userId: number): Promise<GameResult> {
    // Get user's current balance (approved hours - spent hours)
    const balance = await this.shopService.getUserBalance(userId);
    const wager = balance.balance;

    if (wager < GAME_CONFIG.MIN_BALANCE_TO_PLAY) {
      throw new BadRequestException(
        `You need at least ${GAME_CONFIG.MIN_BALANCE_TO_PLAY} unspent hours to play. You have ${wager} hours.`
      );
    }

    // Find or validate the buckshot roulette shop item exists
    const gameItem = await this.findOrCreateGameItem();

    // Determine win/loss with 50/50 odds
    const won = Math.random() < GAME_CONFIG.WIN_PROBABILITY;

    // Calculate the transaction cost:
    // - Win: negative cost (adds hours to balance) = -wager (net gain of wager)
    // - Lose: positive cost (subtracts hours from balance) = +wager
    const transactionCost = won ? -wager : wager;
    const payout = won ? wager * GAME_CONFIG.PAYOUT_MULTIPLIER : 0;

    // Record the transaction
    await this.prisma.transaction.create({
      data: {
        userId,
        itemId: gameItem.itemId,
        itemDescription: won
          ? `Buckshot Roulette WIN: +${wager} hours`
          : `Buckshot Roulette LOSS: -${wager} hours`,
        cost: transactionCost,
      },
    });

    // Get updated balance
    const newBalanceData = await this.shopService.getUserBalance(userId);

    return {
      won,
      wager,
      payout,
      newBalance: newBalanceData.balance,
      message: won
        ? `You won! Gained ${wager} hours. New balance: ${newBalanceData.balance} hours.`
        : `You lost ${wager} hours. New balance: ${newBalanceData.balance} hours.`,
    };
  }

  /**
   * Gets the user's current game statistics.
   * 
   * @param userId - The ID of the user
   * @returns Statistics about the user's buckshot roulette history
   */
  async getGameStats(userId: number) {
    const gameItem = await this.prisma.shopItem.findFirst({
      where: { name: BUCKSHOT_ROULETTE_ITEM_NAME },
    });

    if (!gameItem) {
      return {
        totalGames: 0,
        wins: 0,
        losses: 0,
        netHours: 0,
      };
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        itemId: gameItem.itemId,
      },
    });

    const wins = transactions.filter((t) => t.cost < 0).length;
    const losses = transactions.filter((t) => t.cost > 0).length;
    const netHours = transactions.reduce((sum, t) => sum - t.cost, 0);

    return {
      totalGames: transactions.length,
      wins,
      losses,
      netHours: Math.round(netHours * 10) / 10,
    };
  }

  /**
   * Finds the buckshot roulette shop item, or creates it if it doesn't exist.
   * This ensures the game can function without manual setup.
   */
  private async findOrCreateGameItem() {
    let gameItem = await this.prisma.shopItem.findFirst({
      where: { name: BUCKSHOT_ROULETTE_ITEM_NAME },
    });

    if (!gameItem) {
      // Create the game item if it doesn't exist
      // Cost is 0 since the actual cost is determined by the game outcome
      gameItem = await this.prisma.shopItem.create({
        data: {
          name: BUCKSHOT_ROULETTE_ITEM_NAME,
          description: 'Buckshot Roulette - 50/50 odds, 2x payout. Wager your hours!',
          cost: 0,
          imageUrl: '',
          isActive: false, // Not visible in shop, only used for game transactions
        },
      });
    }

    return gameItem;
  }
}
