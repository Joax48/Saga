import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DATABASE_CLIENT } from './database-client.contract';

import { DatabaseService } from './database.service';
import { OracleDatabaseProvider } from './oracle-database.provider';

@Global()
@Module({
  providers: [
    DatabaseService,
    OracleDatabaseProvider,
    {
      provide: DATABASE_CLIENT,
      useExisting: OracleDatabaseProvider,
    },
  ],
  exports: [DatabaseService, DATABASE_CLIENT],
  imports: [ConfigModule],
})
export class DatabaseModule {}
