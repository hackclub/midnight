import { Module } from "@nestjs/common";
import { MailModule } from "./mail/mail.module";
import { UserModule } from "./user/user.module";
import { PrismaService } from "./prisma.service";
import { RedisService } from "./redis.service";
import { JobLockService } from "./job-lock.service";

//todo: dynamically enable & disable modules based on env. this will allow separate modules to run as separate services
@Module({
  imports: [MailModule, UserModule],
})
export class AppModule {}
