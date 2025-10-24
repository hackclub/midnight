import { Module } from '@nestjs/common';
import { EditRequestsController } from './edit-requests.controller';
import { EditRequestsService } from './edit-requests.service';
import { PrismaService } from '../prisma.service';
import { AirtableModule } from '../airtable/airtable.module';

@Module({
  imports: [AirtableModule],
  controllers: [EditRequestsController],
  providers: [EditRequestsService, PrismaService],
})
export class EditRequestsModule {}
