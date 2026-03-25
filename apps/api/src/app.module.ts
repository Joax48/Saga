import { Module } from '@nestjs/common';
import { SearchModule } from './modules/search/search.module';
import { CacheModule } from './modules/cache/cache.module';

// Root application module.
// When domain modules (ResearchersModule, UnitsModule, ProjectsModule,
// ScientificProductionsModule, AuthModule), BFF controllers, DatabaseModule,
// and application queries are implemented, import and register them here.

@Module({
  imports: [SearchModule, CacheModule]
})
export class AppModule { }
