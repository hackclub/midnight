import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis.service';
import { JobLockService } from '../job-lock.service';

@Module({
  imports: [],
  controllers: [HealthController],
})
export class HealthModule {}
