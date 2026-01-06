import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { PrismaService } from '../prisma.service';
import { ShopService } from '../shop/shop.service';

@Module({
  imports: [ConfigModule],
  controllers: [GameController],
  providers: [GameService, PrismaService, ShopService],
  exports: [GameService],
})
export class GameModule {}
