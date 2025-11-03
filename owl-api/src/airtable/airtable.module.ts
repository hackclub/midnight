import { Module } from '@nestjs/common';
import { AirtableService } from './airtable.service';

@Module({
  providers: [AirtableService],
  exports: [AirtableService],
})
export class AirtableModule {}
