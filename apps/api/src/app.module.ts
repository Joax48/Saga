import { Module } from '@nestjs/common';
import { SearchModule } from './modules/search/search.module';
import { CacheModule } from './modules/cache/cache.module';
import { DatabaseModule } from './common/database/database.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { PublicProjectsController } from './bff/public/projects/public-projects.controller';
import { GetProjectsPaginatedListUseCase } from './application/use-cases/get-public-projects-paginated-list.use-case';
import { SearchPublicProjectsUseCase } from './application/use-cases/search-public-projects.use-case';

// Root application module.
// When domain modules (ResearchersModule, UnitsModule, ProjectsModule,
// ScientificProductionsModule, AuthModule), BFF controllers, DatabaseModule,
// and application queries are implemented, import and register them here.

@Module({
  imports: [SearchModule, CacheModule, DatabaseModule, ProjectsModule],
  controllers: [PublicProjectsController],
  providers: [GetProjectsPaginatedListUseCase, SearchPublicProjectsUseCase],
})
export class AppModule {}
