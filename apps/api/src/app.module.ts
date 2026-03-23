import { Module } from '@nestjs/common';

// Root application module.
// When domain modules (ResearchersModule, UnitsModule, ProjectsModule,
// ScientificProductionsModule, AuthModule), BFF controllers, DatabaseModule,
// and application queries are implemented, import and register them here.

@Module({})
export class AppModule { }
