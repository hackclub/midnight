import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DashboardController } from './dashboard.controller';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis.service';
import { JobLockService } from '../job-lock.service';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
  ],
  controllers: [UserController, AdminController, DashboardController],
  providers: [
    UserService,
    AdminService,
    PrismaService,
    RedisService,
    JobLockService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class UserModule {}
