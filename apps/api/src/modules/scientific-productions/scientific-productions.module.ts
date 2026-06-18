import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module';
import { SCIENTIFIC_PRODUCTIONS_READER } from './scientific-productions.reader.contract';
import { ScientificProductionsReaderService } from './data/scientific-productions.reader-service';
import { ScientificProductionRepository } from './data/scientific-productions.repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    ScientificProductionsReaderService,
    ScientificProductionRepository,
    {
      provide: SCIENTIFIC_PRODUCTIONS_READER,
      useExisting: ScientificProductionsReaderService,
    },
  ],
  exports: [SCIENTIFIC_PRODUCTIONS_READER],
})
export class ScientificProductionsModule {}
