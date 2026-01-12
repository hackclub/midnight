import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { MailModule } from "./mail/mail.module";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { ProjectsModule } from "./projects/projects.module";
import { AdminModule } from "./admin/admin.module";
import { EditRequestsModule } from "./edit-requests/edit-requests.module";
import { HealthModule } from "./health/health.module";
import { UploadsModule } from "./uploads/uploads.module";
import { ShopModule } from "./shop/shop.module";
import { GiftCodesModule } from "./gift-codes/gift-codes.module";
import { SlackModule } from "./slack/slack.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 3600000,
      limit: 1000000,
    }]),
    MailModule,
    UserModule,
    AuthModule,
    ProjectsModule,
    AdminModule,
    EditRequestsModule,
    HealthModule,
    UploadsModule,
    ShopModule,
    GiftCodesModule,
    SlackModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
