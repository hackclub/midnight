import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from '../../../mail-service/src/prisma.service';
import { RedisService } from '../../../mail-service/src/redis.service';
import { JobLockService } from '../job-lock.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PrismaService, RedisService, JobLockService],
})
export class AppModule {}
