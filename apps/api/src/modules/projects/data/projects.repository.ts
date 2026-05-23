import { Inject, Injectable } from '@nestjs/common';

import {
  DATABASE_CLIENT,
  DatabaseClient,
  QueryParameters,
} from '../../../common/database/database-client.contract';
import type {
  ProjectsFilterOptionDto,
  ProjectsFiltersDto,
  ProjectsFiltersRequestDto,
} from '../projects.reader.contract';
import type { Project, ProjectAssociatedProfile, ProjectDetail } from '../project.entity';
import {
  COUNT_PROJECTS_QUERY,
  PROJECT_BASE_SELECT,
  PROJECT_BASE_FROM,
  PROJECT_DISCIPLINES_BY_PROJECT_SELECT,
  PROJECT_DETAIL_SELECT,
  PROJECT_KEYWORDS_BY_PROJECT_IDS_SELECT,
  PROJECT_KEYWORDS_BY_PROJECT_SELECT,
  PROJECT_KEYWORDS_FILTER_OPTIONS_GROUP_ORDER,
  PROJECT_KEYWORDS_FILTER_OPTIONS_JOIN,
  PROJECT_KEYWORDS_FILTER_OPTIONS_SELECT,
  PROJECT_PARTICIPATIONS_SELECT,
  PROJECT_RESEARCH_TYPE_FILTER_OPTIONS_GROUP_ORDER,
  PROJECT_RESEARCH_TYPE_FILTER_OPTIONS_SELECT,
  PROJECT_STATUS_FILTER_OPTIONS_GROUP_ORDER,
  PROJECT_STATUS_FILTER_OPTIONS_SELECT,
  PROJECT_START_YEAR_FILTER_OPTIONS_GROUP_ORDER,
  PROJECT_START_YEAR_FILTER_OPTIONS_SELECT,
  PROJECT_TYPE_FILTER_OPTIONS_GROUP_ORDER,
  PROJECT_TYPE_FILTER_OPTIONS_SELECT,
  PROJECT_FILTER_PARTICIPANTS_JOIN_SUFFIX,
} from './projects.queries';
import { ProjectsMapper } from './projects.mapper';
import { ProjectsSqlFilterBuilder } from './projects-sql-filter.builder';
import type {
  BuiltNamedWhereClause,
  BuiltPaginatedProjectsWhereClause,
  PaginatedResult,
  ProjectCountRow,
  ProjectDetailRow,
  ProjectFilterValueRow,
  ProjectKeywordByProjectRow,
  ProjectParticipationRow,
  ProjectRow,
} from './projects.repository.types';

@Injectable()
export class ProjectsRepository {
  private readonly sqlFilterBuilder = new ProjectsSqlFilterBuilder();
  private readonly mapper = new ProjectsMapper();

  constructor(
    @Inject(DATABASE_CLIENT)
    private readonly databaseClient: DatabaseClient,
  ) {}

  async findFilterOptions(
    searchTerm?: string,
    filters?: ProjectsFiltersRequestDto,
  ): Promise<ProjectsFiltersDto> {
    const researchTypeWhere = this.sqlFilterBuilder.buildFilterOptionsWhereClause(
      searchTerm,
      filters,
      ['researchType'],
    );
    const projectTypeWhere = this.sqlFilterBuilder.buildFilterOptionsWhereClause(
      searchTerm,
      filters,
      ['projectType'],
    );
    const startYearWhere = this.sqlFilterBuilder.buildFilterOptionsWhereClause(
      searchTerm,
      filters,
      ['startYear'],
    );
    const statusWhere = this.sqlFilterBuilder.buildFilterOptionsWhereClause(
      searchTerm,
      filters,
      ['status'],
    );
    const participantsWhere = this.sqlFilterBuilder.buildFilterOptionsWhereClause(
      searchTerm,
      filters,
      ['participants'],
    );
    const keywordsWhere = this.sqlFilterBuilder.buildFilterOptionsWhereClause(
      searchTerm,
      filters,
      ['keywords'],
    );

    const researchType = await this.findDistinctFilterOptions(
      `
          ${this.sqlFilterBuilder.buildFilterOptionsCte(filters, ['researchType'])}
        ${PROJECT_RESEARCH_TYPE_FILTER_OPTIONS_SELECT}
        ${this.sqlFilterBuilder.buildFilterOptionsJoinBase(filters)}
        ${researchTypeWhere.clause}
        ${PROJECT_RESEARCH_TYPE_FILTER_OPTIONS_GROUP_ORDER}
        `,
      researchTypeWhere.params,
    );

    const projectType = await this.findDistinctFilterOptions(
      `
          ${this.sqlFilterBuilder.buildFilterOptionsCte(filters, ['projectType'])}
        ${PROJECT_TYPE_FILTER_OPTIONS_SELECT}
        ${this.sqlFilterBuilder.buildFilterOptionsJoinBase(filters)}
        ${projectTypeWhere.clause}
        ${PROJECT_TYPE_FILTER_OPTIONS_GROUP_ORDER}
      `,
      projectTypeWhere.params,
    );

    const startYear = await this.findDistinctFilterOptions(
      `
        ${PROJECT_START_YEAR_FILTER_OPTIONS_SELECT}
        ${
          this.sqlFilterBuilder.normalizeFilterValues(filters?.participants).length > 0
            ? PROJECT_FILTER_PARTICIPANTS_JOIN_SUFFIX
            : ''
        }
        ${startYearWhere.clause}
        ${PROJECT_START_YEAR_FILTER_OPTIONS_GROUP_ORDER}
        `,
      startYearWhere.params,
    );

    const status = await this.findDistinctFilterOptions(
      `
        ${this.sqlFilterBuilder.buildFilterOptionsCte(filters, ['status'])}
        ${PROJECT_STATUS_FILTER_OPTIONS_SELECT}
        ${this.sqlFilterBuilder.buildFilterOptionsJoinBase(filters)}
        ${statusWhere.clause}
        ${PROJECT_STATUS_FILTER_OPTIONS_GROUP_ORDER}
      `,
      statusWhere.params,
    );

    const participants = await this.findDistinctFilterOptions(
      this.sqlFilterBuilder.buildParticipantsFilterOptionsQuery(
        participantsWhere,
        filters,
      ),
      participantsWhere.params,
    );

    const keywords = await this.findKeywordFilterOptions(keywordsWhere, filters);

    return { researchType, projectType, startYear, status, participants, keywords };
  }

  async findPaginated(
    page: number,
    limit: number,
    searchTerm?: string | null,
    filters?: ProjectsFiltersRequestDto,
  ): Promise<PaginatedResult<Project>> {
    const offset = this.calculateOffset(page, limit);
    const builtWhereClause = this.sqlFilterBuilder.buildPaginatedProjectsWhereClause(
      searchTerm,
      filters,
    );
    const [items, total] = await Promise.all([
      this.findItemsPage(limit, offset, builtWhereClause),
      this.countProjects(builtWhereClause),
    ]);

    return {
      items,
      total,
    };
  }

  async findById(id: string): Promise<ProjectDetail | null> {
    const projectId = id?.trim();
    if (!projectId) {
      return null;
    }

    const rows = await this.databaseClient.query<ProjectDetailRow>(
      `${PROJECT_DETAIL_SELECT} WHERE research_project.PROJECT_ID = :projectId`,
      { projectId },
    );

    const row = rows[0];

    if (!row) {
      return null;
    }

    const [associatedProfiles, disciplines, keywords] = await Promise.all([
      this.findAssociatedProfiles(projectId, row.projectManagerId),
      this.findDisciplines(projectId),
      this.findKeywords(projectId),
    ]);

    return this.mapper.mapProjectDetail(row, associatedProfiles, disciplines, keywords);
  }

  private async findItemsPage(
    limit: number,
    offset: number,
    builtWhereClause: BuiltPaginatedProjectsWhereClause,
  ): Promise<Project[]> {
    const rows = await this.databaseClient.query<ProjectRow>(
      `
        ${PROJECT_BASE_SELECT}
        ${PROJECT_BASE_FROM}
        ${builtWhereClause.clause}
        ORDER BY "name" ASC
        OFFSET :offset ROWS
        FETCH NEXT :limit ROWS ONLY
      `,
      {
        ...builtWhereClause.params,
        offset,
        limit,
      },
    );

    if (rows.length === 0) {
      return [];
    }

    const keywordsByProjectId = await this.findKeywordsByProjectIds(
      rows.map((row) => row.id),
    );

    return rows.map((row) =>
      this.mapper.mapProject(row, keywordsByProjectId.get(row.id) ?? []),
    );
  }

  private async countProjects(
    builtWhereClause: BuiltPaginatedProjectsWhereClause,
  ): Promise<number> {
    const totalRows = await this.databaseClient.query<ProjectCountRow>(
      `
        ${COUNT_PROJECTS_QUERY}
        ${builtWhereClause.clause}
      `,
      builtWhereClause.params,
    );

    return totalRows[0]?.totalCount ?? 0;
  }

  private async findAssociatedProfiles(
    projectId: string,
    projectManagerId: number | null,
  ): Promise<ProjectAssociatedProfile[]> {
    const rows = await this.databaseClient.query<ProjectParticipationRow>(
      `${PROJECT_PARTICIPATIONS_SELECT} WHERE member_participation.PROJECT_ID = :projectId ORDER BY member_profile.PROFILE_ID ASC`,
      { projectId },
    );

    return this.mapper.mapAssociatedProfiles(rows, projectManagerId);
  }

  private async findDisciplines(projectId: string): Promise<string[]> {
    const rows = await this.databaseClient.query<{ description: string }>(
      `${PROJECT_DISCIPLINES_BY_PROJECT_SELECT} WHERE project_discipline_link.PROJECT_ID = :projectId ORDER BY discipline.DISCIPLINE_NAME ASC`,
      { projectId },
    );

    return rows.map((row) => row.description);
  }

  private async findKeywords(projectId: string): Promise<string[]> {
    const rows = await this.databaseClient.query<{ description: string }>(
      `${PROJECT_KEYWORDS_BY_PROJECT_SELECT} WHERE project_keyword_link.PROJECT_ID = :projectId ORDER BY keyword.KEYWORD ASC`,
      { projectId },
    );

    return rows.map((row) => row.description);
  }

  private async findKeywordsByProjectIds(
    projectIds: number[],
  ): Promise<Map<number, string[]>> {
    if (projectIds.length === 0) {
      return new Map<number, string[]>();
    }

    const placeholders = projectIds.map((_, index) => `:projectId${index}`).join(', ');

    const params = projectIds.reduce<Record<string, unknown>>(
      (acc, id, index) => ({
        ...acc,
        [`projectId${index}`]: id,
      }),
      {},
    );

    const rows = await this.databaseClient.query<ProjectKeywordByProjectRow>(
      `
        ${PROJECT_KEYWORDS_BY_PROJECT_IDS_SELECT}
        WHERE project_keyword_link.PROJECT_ID IN (${placeholders})
        ORDER BY project_keyword_link.PROJECT_ID ASC, keyword.KEYWORD ASC
      `,
      params,
    );

    return rows.reduce((keywordsByProjectId, row) => {
      const projectKeywords = keywordsByProjectId.get(row.projectId) ?? [];

      projectKeywords.push(row.description);

      keywordsByProjectId.set(row.projectId, projectKeywords);

      return keywordsByProjectId;
    }, new Map<number, string[]>());
  }

  private async findDistinctFilterOptions(
    query: string,
    params: QueryParameters = {},
  ): Promise<ProjectsFilterOptionDto[]> {
    const rows = await this.databaseClient.query<ProjectFilterValueRow>(query, params);

    return this.mapper.mapDistinctFilterOptions(rows);
  }

  private async findKeywordFilterOptions(
    builtWhereClause: BuiltNamedWhereClause,
    filters?: ProjectsFiltersRequestDto,
  ): Promise<ProjectsFilterOptionDto[]> {
    const rows = await this.databaseClient.query<ProjectFilterValueRow>(
      `
      ${this.sqlFilterBuilder.buildFilterOptionsCte(filters, ['keywords'])}
      ${PROJECT_KEYWORDS_FILTER_OPTIONS_SELECT}
      ${this.sqlFilterBuilder.buildFilterOptionsJoinBase(filters)}
      ${PROJECT_KEYWORDS_FILTER_OPTIONS_JOIN}
      ${builtWhereClause.clause}
      ${PROJECT_KEYWORDS_FILTER_OPTIONS_GROUP_ORDER}
    `,
      builtWhereClause.params,
    );

    return this.mapper.mapKeywordFilterOptions(rows);
  }

  private calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }
}
