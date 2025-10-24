import { Module } from "@nestjs/common";
import { MailModule } from "./mail/mail.module";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { ProjectsModule } from "./projects/projects.module";
import { AdminModule } from "./admin/admin.module";
import { EditRequestsModule } from "./edit-requests/edit-requests.module";

//todo: dynamically enable & disable modules based on env. this will allow separate modules to run as separate services
@Module({
  imports: [MailModule, UserModule, AuthModule, ProjectsModule, AdminModule, EditRequestsModule],
})
export class AppModule {}
