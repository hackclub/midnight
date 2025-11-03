import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma.service';
import { AuthGuard } from '../auth/auth.guard';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, PrismaService, AuthGuard],
  exports: [ProjectsService],
})
export class ProjectsModule {}
