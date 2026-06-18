import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DATABASE_CLIENT } from './database-client.contract';

import { OracleDatabaseProvider } from './oracle-database.provider';

@Global()
@Module({
  providers: [
    OracleDatabaseProvider,
    {
      provide: DATABASE_CLIENT,
      useExisting: OracleDatabaseProvider,
    },
  ],
  exports: [DATABASE_CLIENT],
  imports: [ConfigModule],
})
export class DatabaseModule {}
