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
  COORDINATOR_PARTICIPATION_ID,
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
  PROJECT_MANAGER_NAME_ORACLE_SQL,
  PROJECT_START_DATES_CTE,
  PROJECT_RESEARCH_TYPE_FILTER_OPTIONS_GROUP_ORDER,
  PROJECT_RESEARCH_TYPE_FILTER_OPTIONS_SELECT,
  PROJECT_STATUS_FILTER_OPTIONS_GROUP_ORDER,
  PROJECT_STATUS_FILTER_OPTIONS_SELECT,
  PROJECT_START_YEAR_FILTER_OPTIONS_GROUP_ORDER,
  PROJECT_START_YEAR_FILTER_OPTIONS_SELECT,
  PROJECT_TYPE_FILTER_OPTIONS_GROUP_ORDER,
  PROJECT_TYPE_FILTER_OPTIONS_SELECT,
  SEARCH_PROJECTS_WHERE,
  PROJECT_FILTER_PARTICIPANTS_JOIN_SUFFIX,
  PROJECT_FILTER_BASIC_JOIN_BASE_WITHOUT_PERIOD,
  PROJECT_FILTER_START_DATES_JOIN,
} from './projects.queries';

type PaginatedResult<T> = {
  items: T[];
  total: number;
};

type ProjectCountRow = {
  totalCount: number;
};

type ProjectRow = {
  id: number;
  projectManagerId: number;
  projectManagerName: string;
  code: string;
  name: string;
  projectType: string;
  fundingType: string;
  researchType: string;
  status: string;
  startDate: string;
  endDate: string;
};

type ProjectFilterValueRow = {
  label: string;
  optionValue?: string;
  optionCount: number;
};

type ProjectDetailRow = {
  id: string;
  projectManagerId: number | null;
  projectManagerName: string | null;
  code: string;
  name: string;
  description: string | null;
  unitId: number | null;
  unitName: string | null;
  projectType: string | null;
  fundingType: string | null;
  researchType: string | null;
  status: string | null;
  startDate: string | null;
  endDate: string | null;
  principalParticipationStartDate: string | null;
  principalParticipationEndDate: string | null;
};

type ProjectParticipationRow = {
  id: number;
  name: string;
  role: string;
  participationTypeId: number;
  participationStartDate: string;
  participationEndDate: string;
  participationStartTs: Date | string | null;
  participationEndTs: Date | string | null;
};

type ProjectKeywordByProjectRow = {
  projectId: number;
  description: string;
};

type BuiltPaginatedProjectsWhereClause = {
  clause: string;
  params: Record<string, unknown>;
};

type BuiltNamedWhereClause = {
  clause: string;
  params: QueryParameters;
};

type FilterField = keyof ProjectsFiltersRequestDto;

@Injectable()
export class ProjectsRepository {
  constructor(
    @Inject(DATABASE_CLIENT)
    private readonly databaseClient: DatabaseClient,
  ) {}

  async findFilterOptions(
    searchTerm?: string,
    filters?: ProjectsFiltersRequestDto,
  ): Promise<ProjectsFiltersDto> {
    const researchTypeWhere = this.buildFilterOptionsWhereClause(searchTerm, filters, [
      'researchType',
    ]);
    const projectTypeWhere = this.buildFilterOptionsWhereClause(searchTerm, filters);
    const startYearWhere = this.buildFilterOptionsWhereClause(searchTerm, filters, [
      'startYear',
    ]);
    const statusWhere = this.buildFilterOptionsWhereClause(searchTerm, filters, [
      'status',
    ]);
    const participantsWhere = this.buildFilterOptionsWhereClause(searchTerm, filters, [
      'participants',
    ]);
    const keywordsWhere = this.buildFilterOptionsWhereClause(searchTerm, filters, [
      'keywords',
    ]);

    const researchType = await this.findDistinctFilterOptions(
      `
          ${this.buildFilterOptionsCte(filters, ['researchType'])}
        ${PROJECT_RESEARCH_TYPE_FILTER_OPTIONS_SELECT}
        ${this.buildFilterOptionsJoinBase(filters)}
        ${researchTypeWhere.clause}
        ${PROJECT_RESEARCH_TYPE_FILTER_OPTIONS_GROUP_ORDER}
        `,
      researchTypeWhere.params,
    );

    const projectType = await this.findDistinctFilterOptions(
      `
          ${this.buildFilterOptionsCte(filters, ['projectType'])}
        ${PROJECT_TYPE_FILTER_OPTIONS_SELECT}
        ${this.buildFilterOptionsJoinBase(filters)}
        ${projectTypeWhere.clause}
        ${PROJECT_TYPE_FILTER_OPTIONS_GROUP_ORDER}
      `,
      projectTypeWhere.params,
    );

    const startYear = await this.findDistinctFilterOptions(
      `
        ${PROJECT_START_YEAR_FILTER_OPTIONS_SELECT}
        ${
          this.normalizeFilterValues(filters?.participants).length > 0
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
          ${this.buildFilterOptionsCte(filters, ['status'])}
        ${PROJECT_STATUS_FILTER_OPTIONS_SELECT}
        ${this.buildFilterOptionsJoinBase(filters)}
        ${statusWhere.clause}
        ${PROJECT_STATUS_FILTER_OPTIONS_GROUP_ORDER}
      `,
      statusWhere.params,
    );

    const participants = await this.findDistinctFilterOptions(
      await this.buildParticipantsFilterOptionsQuery(participantsWhere, filters),
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
    const builtWhereClause = this.buildPaginatedProjectsWhereClause(searchTerm, filters);
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

    return this.mapRowToProjectDetail(row, associatedProfiles, disciplines, keywords);
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
      this.mapRowToProject(row, keywordsByProjectId.get(row.id) ?? []),
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

    const deduped = this.buildUniqueAssociatedProfiles(rows, projectManagerId);

    return deduped.map((row) => ({
      id: row.id,
      name: row.name,
      ...(row.role ? { role: row.role } : {}),
      ...(row.participationStartDate
        ? { participationStartDate: row.participationStartDate }
        : {}),
      ...(row.participationEndDate
        ? { participationEndDate: row.participationEndDate }
        : {}),
    }));
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

  private buildUniqueAssociatedProfiles(
    rows: ProjectParticipationRow[],
    projectManagerId: number | null,
  ): ProjectParticipationRow[] {
    const rowsByProfileId = new Map<number, ProjectParticipationRow>();

    for (const row of rows) {
      if (projectManagerId != null && row.id === projectManagerId) {
        continue;
      }

      const current = rowsByProfileId.get(row.id);
      if (!current || this.compareParticipationRows(row, current) > 0) {
        rowsByProfileId.set(row.id, row);
      }
    }

    return Array.from(rowsByProfileId.values()).sort((a, b) => a.id - b.id);
  }

  private compareParticipationRows(
    a: ProjectParticipationRow,
    b: ProjectParticipationRow,
  ): number {
    const participationStartComparison = this.compareParticipationStart(
      a.participationStartTs,
      b.participationStartTs,
    );

    if (participationStartComparison !== 0) {
      return participationStartComparison;
    }

    const participationEndComparison = this.compareParticipationStart(
      a.participationEndTs,
      b.participationEndTs,
    );

    if (participationEndComparison !== 0) {
      return participationEndComparison;
    }

    if (
      a.participationTypeId === COORDINATOR_PARTICIPATION_ID &&
      b.participationTypeId !== COORDINATOR_PARTICIPATION_ID
    ) {
      return 1;
    }

    if (
      a.participationTypeId !== COORDINATOR_PARTICIPATION_ID &&
      b.participationTypeId === COORDINATOR_PARTICIPATION_ID
    ) {
      return -1;
    }

    return 0;
  }

  private compareParticipationStart(
    a: Date | string | null | undefined,
    b: Date | string | null | undefined,
  ): number {
    return this.toParticipationTime(a) - this.toParticipationTime(b);
  }

  private toParticipationTime(value: Date | string | null | undefined): number {
    if (value == null) {
      return Number.NEGATIVE_INFINITY;
    }

    const date = value instanceof Date ? value : new Date(value);
    const time = date.getTime();

    return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
  }

  private async findKeywordsByProjectIds(
    projectIds: number[],
  ): Promise<Map<number, string[]>> {
    if (projectIds.length === 0) {
      return new Map<number, string[]>();
    }

    const placeholders = projectIds.map((_, index) => `:projectId${index}`).join(', ');

    const params = projectIds.reduce(
      (acc, id, index) => ({
        ...acc,
        [`projectId${index}`]: id,
      }),
      {},
    );

    const rows = await this.databaseClient.query<ProjectKeywordByProjectRow>(
      `
        ${PROJECT_KEYWORDS_BY_PROJECT_IDS_SELECT}
        WHERE PK.PROJECT_ID IN (${placeholders})
        ORDER BY PK.PROJECT_ID ASC, K.KEYWORD ASC
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

  private normalizeSearchTerm(searchTerm?: string | null): string | null {
    const normalizedSearchTerm = searchTerm?.trim();
    return normalizedSearchTerm ? `%${normalizedSearchTerm}%` : null;
  }

  private normalizeFilterValues(values?: string[]): string[] {
    return Array.from(
      new Set((values ?? []).map((value) => value.trim().toLowerCase()).filter(Boolean)),
    );
  }

  private buildInClause(
    columnSql: string,
    parameterPrefix: string,
    values: string[],
  ): string {
    const placeholders = values
      .map((_, index) => `:${parameterPrefix}${index}`)
      .join(', ');

    return `${columnSql} IN (${placeholders})`;
  }

  private buildKeywordsLikeClause(values: string[]): string {
    const clauses = values
      .map(() => 'LOWER(Project_Keyword.description) LIKE ?')
      .join(' OR ');

    return `EXISTS (
      SELECT 1
      FROM Project_Keyword_Relation
      INNER JOIN Project_Keyword
        ON Project_Keyword_Relation.keyword_id = Project_Keyword.id
      WHERE Project_Keyword_Relation.project_id = Project.id
        AND (${clauses})
    )`;
  }

  private async findDistinctFilterOptions(
    query: string,
    params: QueryParameters = {},
  ): Promise<ProjectsFilterOptionDto[]> {
    const rows = await this.databaseClient.query<ProjectFilterValueRow>(query, params);

    return rows.map((row) => ({
      label: row.label,
      value: this.normalizeFacetValue(row.optionValue, row.label),
      count: row.optionCount,
    }));
  }

  private async findKeywordFilterOptions(
    builtWhereClause: BuiltNamedWhereClause,
    filters?: ProjectsFiltersRequestDto,
  ): Promise<ProjectsFilterOptionDto[]> {
    const rows = await this.databaseClient.query<ProjectFilterValueRow>(
      `
      ${this.buildFilterOptionsCte(filters, ['keywords'])}
      ${PROJECT_KEYWORDS_FILTER_OPTIONS_SELECT}
      ${this.buildFilterOptionsJoinBase(filters)}
      ${PROJECT_KEYWORDS_FILTER_OPTIONS_JOIN}
      ${builtWhereClause.clause}
      ${PROJECT_KEYWORDS_FILTER_OPTIONS_GROUP_ORDER}
    `,
      builtWhereClause.params,
    );

    return rows.map((row) => ({
      label: this.toTitleCase(row.label ?? row.optionValue ?? ''),
      value: this.normalizeFacetValue(
        row.optionValue,
        row.label ?? row.optionValue ?? '',
      ),
      count: row.optionCount,
    }));
  }

  private async buildParticipantsFilterOptionsQuery(
    builtWhereClause: BuiltNamedWhereClause,
    filters?: ProjectsFiltersRequestDto,
  ): Promise<string> {
    const startDateCte = this.buildFilterOptionsCte(filters, ['participants']).trim();
    const ctePrefix = startDateCte ? `${startDateCte.replace(/^WITH\s+/i, '')}, ` : '';

    return `
      WITH ${ctePrefix}filtered_projects AS (
        SELECT /*+ MATERIALIZE */ DISTINCT PRODUCCION_CIENTIFICA.PROJECT.PROJECT_ID
        ${this.buildFilterOptionsJoinBase(filters, ['participants'])}
        ${builtWhereClause.clause}
      ),
      participant_counts AS (
        SELECT
          PRODUCCION_CIENTIFICA.UCR_PROFILE_PROJECT_UNIT.PROFILE_ID,
          COUNT(DISTINCT PRODUCCION_CIENTIFICA.UCR_PROFILE_PROJECT_UNIT.PROJECT_ID) AS optionCount
        FROM PRODUCCION_CIENTIFICA.UCR_PROFILE_PROJECT_UNIT
        INNER JOIN filtered_projects
          ON filtered_projects.PROJECT_ID = PRODUCCION_CIENTIFICA.UCR_PROFILE_PROJECT_UNIT.PROJECT_ID
        GROUP BY PRODUCCION_CIENTIFICA.UCR_PROFILE_PROJECT_UNIT.PROFILE_ID
      )
      SELECT
        ${PROJECT_MANAGER_NAME_ORACLE_SQL} AS "label",
        LOWER(${PROJECT_MANAGER_NAME_ORACLE_SQL}) AS "optionValue",
        participant_counts.optionCount AS "optionCount"
      FROM participant_counts
      INNER JOIN PRODUCCION_CIENTIFICA.PROFILE
        ON participant_counts.PROFILE_ID = PRODUCCION_CIENTIFICA.PROFILE.PROFILE_ID
      GROUP BY
        ${PROJECT_MANAGER_NAME_ORACLE_SQL},
        participant_counts.optionCount
      ORDER BY "label" ASC
    `;
  }

  private buildFilterOptionsJoinBase(
    filters?: ProjectsFiltersRequestDto,
    excludedFilters: FilterField[] = [],
    options: { requirePeriod?: boolean; requireParticipants?: boolean } = {},
  ): string {
    const joins: string[] = [];

    const shouldIncludePeriod =
      options.requirePeriod ??
      (this.normalizeFilterValues(filters?.startYear).length > 0 &&
        !this.shouldSkipFilter('startYear', excludedFilters));
    const shouldIncludeParticipants =
      options.requireParticipants ??
      (this.normalizeFilterValues(filters?.participants).length > 0 &&
        !this.shouldSkipFilter('participants', excludedFilters));

    joins.push(PROJECT_FILTER_BASIC_JOIN_BASE_WITHOUT_PERIOD.trimEnd());

    if (shouldIncludePeriod) {
      joins.push(PROJECT_FILTER_START_DATES_JOIN.trimEnd());
    }

    if (shouldIncludeParticipants) {
      joins.push(PROJECT_FILTER_PARTICIPANTS_JOIN_SUFFIX.trimEnd());
    }

    return joins.join('\n');
  }

  private buildFilterOptionsCte(
    filters?: ProjectsFiltersRequestDto,
    excludedFilters: FilterField[] = [],
  ): string {
    const shouldIncludePeriod =
      this.normalizeFilterValues(filters?.startYear).length > 0 &&
      !this.shouldSkipFilter('startYear', excludedFilters);

    return shouldIncludePeriod ? `${PROJECT_START_DATES_CTE.trimEnd()}\n` : '';
  }

  private buildFilterOptionsWhereClause(
    searchTerm?: string | null,
    filters?: ProjectsFiltersRequestDto,
    excludedFilters: FilterField[] = [],
  ): BuiltNamedWhereClause {
    const clauses: string[] = [];
    const params: QueryParameters = {};
    let bindIndex = 0;

    const addBind = (prefix: string, value: unknown): string => {
      const bindName = `${prefix}${bindIndex}`;
      bindIndex += 1;
      params[bindName] = value;
      return `:${bindName}`;
    };

    const normalizedSearchTerm = this.normalizeSearchTerm(searchTerm);
    if (normalizedSearchTerm) {
      const codeBind = addBind('searchTermCode', normalizedSearchTerm);
      const nameBind = addBind('searchTermName', normalizedSearchTerm);
      clauses.push(
        `(LOWER(TO_CHAR(PRODUCCION_CIENTIFICA.PROJECT.PROJECT_ID)) LIKE LOWER(${codeBind}) OR LOWER(PRODUCCION_CIENTIFICA.PROJECT.PROJECT_NAME) LIKE LOWER(${nameBind}))`,
      );
    }

    const researchTypes = this.normalizeFilterValues(filters?.researchType);
    if (
      !this.shouldSkipFilter('researchType', excludedFilters) &&
      researchTypes.length > 0
    ) {
      const binds = researchTypes.map((researchType) =>
        addBind('researchType', researchType),
      );
      clauses.push(
        `LOWER(PRODUCCION_CIENTIFICA.PROJECT_RESEARCH_TYPE.PROJECT_RESEARCH_TYPE_NAME) IN (${binds.join(', ')})`,
      );
    }

    const projectTypes = this.normalizeFilterValues(filters?.projectType);
    if (
      !this.shouldSkipFilter('projectType', excludedFilters) &&
      projectTypes.length > 0
    ) {
      const binds = projectTypes.map((projectType) =>
        addBind('projectType', projectType),
      );
      clauses.push(
        `LOWER(PRODUCCION_CIENTIFICA.PROJECT_TYPE.PROJECT_TYPE_NAME) IN (${binds.join(', ')})`,
      );
    }

    const startYears = this.normalizeFilterValues(filters?.startYear);
    if (!this.shouldSkipFilter('startYear', excludedFilters) && startYears.length > 0) {
      const binds = startYears.map((startYear) => addBind('startYear', startYear));
      clauses.push(
        `TO_CHAR(project_start_dates.PROJECT_START_DATE, 'YYYY') IN (${binds.join(', ')})`,
      );
    }

    const statuses = this.normalizeFilterValues(filters?.status);
    if (!this.shouldSkipFilter('status', excludedFilters) && statuses.length > 0) {
      const binds = statuses.map((status) => addBind('status', status));
      clauses.push(
        `LOWER(PRODUCCION_CIENTIFICA.PROJECT_STATUS.PROJECT_STATUS_NAME) IN (${binds.join(', ')})`,
      );
    }

    const participants = this.normalizeFilterValues(filters?.participants);
    if (
      !this.shouldSkipFilter('participants', excludedFilters) &&
      participants.length > 0
    ) {
      const binds = participants.map((participant) =>
        addBind('participant', participant),
      );
      clauses.push(`LOWER(${PROJECT_MANAGER_NAME_ORACLE_SQL}) IN (${binds.join(', ')})`);
    }

    const keywords = this.normalizeFilterValues(filters?.keywords);
    if (!this.shouldSkipFilter('keywords', excludedFilters) && keywords.length > 0) {
      const keywordClauses = keywords.map((keyword) => {
        const bind = addBind('keyword', `%${keyword}%`);
        return `LOWER(PRODUCCION_CIENTIFICA.KEYWORD.KEYWORD) LIKE ${bind}`;
      });
      clauses.push(`EXISTS (
      SELECT 1
      FROM PRODUCCION_CIENTIFICA.PROJECT_KEYWORD
      INNER JOIN PRODUCCION_CIENTIFICA.KEYWORD
        ON PRODUCCION_CIENTIFICA.PROJECT_KEYWORD.KEYWORD_ID = PRODUCCION_CIENTIFICA.KEYWORD.KEYWORD_ID
      WHERE PRODUCCION_CIENTIFICA.PROJECT_KEYWORD.PROJECT_ID = PRODUCCION_CIENTIFICA.PROJECT.PROJECT_ID
        AND (${keywordClauses.join(' OR ')})
    )`);
    }

    return {
      clause: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
      params,
    };
  }

  private normalizeFacetValue(value: string | undefined, fallbackLabel: string): string {
    const normalizedValue = value?.trim();
    return normalizedValue ? normalizedValue : fallbackLabel;
  }

  private shouldSkipFilter(field: FilterField, excludedFilters: FilterField[]): boolean {
    return excludedFilters.includes(field);
  }

  private buildPaginatedProjectsWhereClause(
    searchTerm?: string | null,
    filters?: ProjectsFiltersRequestDto,
    excludedFilters: FilterField[] = [],
  ): BuiltPaginatedProjectsWhereClause {
    const clauses: string[] = [];
    const params: Record<string, unknown> = {};

    const normalizedSearchTerm = this.normalizeSearchTerm(searchTerm);

    if (normalizedSearchTerm) {
      clauses.push(`(${SEARCH_PROJECTS_WHERE.trim().replace(/^WHERE\s+/i, '')})`);

      params.searchTerm = normalizedSearchTerm;
    }

    const researchTypes = this.normalizeFilterValues(filters?.researchType);

    if (
      !this.shouldSkipFilter('researchType', excludedFilters) &&
      researchTypes.length > 0
    ) {
      clauses.push(
        this.buildInClause(
          'LOWER(research_type_lookup.PROJECT_RESEARCH_TYPE_NAME)',
          'researchType',
          researchTypes,
        ),
      );

      researchTypes.forEach((value, index) => {
        params[`researchType${index}`] = value;
      });
    }

    const projectTypes = this.normalizeFilterValues(filters?.projectType);

    if (
      !this.shouldSkipFilter('projectType', excludedFilters) &&
      projectTypes.length > 0
    ) {
      clauses.push(
        this.buildInClause(
          'LOWER(project_type_lookup.PROJECT_TYPE_NAME)',
          'projectType',
          projectTypes,
        ),
      );

      projectTypes.forEach((value, index) => {
        params[`projectType${index}`] = value;
      });
    }

    const startYears = this.normalizeFilterValues(filters?.startYear);

    if (!this.shouldSkipFilter('startYear', excludedFilters) && startYears.length > 0) {
      clauses.push(
        this.buildInClause(
          `TO_CHAR(project_period_aggregate.AGGREGATE_START_DATE, 'YYYY')`,
          'startYear',
          startYears,
        ),
      );

      startYears.forEach((value, index) => {
        params[`startYear${index}`] = value;
      });
    }

    const statuses = this.normalizeFilterValues(filters?.status);

    if (!this.shouldSkipFilter('status', excludedFilters) && statuses.length > 0) {
      clauses.push(
        this.buildInClause(
          'LOWER(status_lookup.PROJECT_STATUS_NAME)',
          'status',
          statuses,
        ),
      );

      statuses.forEach((value, index) => {
        params[`status${index}`] = value;
      });
    }

    const participants = this.normalizeFilterValues(filters?.participants);

    if (
      !this.shouldSkipFilter('participants', excludedFilters) &&
      participants.length > 0
    ) {
      const participantClauses = participants.map(
        (_, index) => `
        LOWER(
          TRIM(
            profile.PROFILE_NAME
            || ' ' ||
            profile.PROFILE_FIRST_SURNAME
            || CASE
              WHEN profile.PROFILE_LAST_SURNAME IS NULL
                OR profile.PROFILE_LAST_SURNAME = ''
              THEN ''
              ELSE ' ' || profile.PROFILE_LAST_SURNAME
            END
          )
        ) = :participant${index}
      `,
      );

      clauses.push(`
      EXISTS (
        SELECT 1
        FROM PRODUCCION_CIENTIFICA.UCR_PROFILE_PROJECT_UNIT uppu
        INNER JOIN PRODUCCION_CIENTIFICA.PROFILE profile
          ON uppu.PROFILE_ID = profile.PROFILE_ID
        WHERE uppu.PROJECT_ID = research_project.PROJECT_ID
          AND (${participantClauses.join(' OR ')})
      )
    `);

      participants.forEach((value, index) => {
        params[`participant${index}`] = value;
      });
    }
    const keywords = this.normalizeFilterValues(filters?.keywords);

    if (!this.shouldSkipFilter('keywords', excludedFilters) && keywords.length > 0) {
      const keywordClauses = keywords.map(
        (_, index) => `LOWER(keyword.KEYWORD) LIKE :keyword${index}`,
      );

      clauses.push(`
        EXISTS (
          SELECT 1
          FROM PRODUCCION_CIENTIFICA.PROJECT_KEYWORD pk
          INNER JOIN PRODUCCION_CIENTIFICA.KEYWORD keyword
            ON pk.KEYWORD_ID = keyword.KEYWORD_ID
          WHERE pk.PROJECT_ID = research_project.PROJECT_ID
            AND (${keywordClauses.join(' OR ')})
        )
      `);

      keywords.forEach((value, index) => {
        params[`keyword${index}`] = `%${value}%`;
      });
    }

    return {
      clause: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
      params,
    };
  }

  private calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  private mapRowToProject(row: ProjectRow, keywords: string[]): Project {
    return {
      id: row.id,
      projectManager: {
        id: row.projectManagerId,
        name: row.projectManagerName,
      },
      code: row.code,
      name: row.name,
      keywords,
      projectType: row.projectType,
      fundingType: row.fundingType,
      researchType: row.researchType,
      status: row.status,
      startDate: row.startDate,
      endDate: row.endDate,
    };
  }

  private toTitleCase(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    return value
      .toLowerCase()
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private mapRowToProjectDetail(
    row: ProjectDetailRow,
    associatedProfiles: ProjectAssociatedProfile[],
    disciplines: string[],
    keywords: string[],
  ): ProjectDetail {
    const projectManager = {
      ...(row.projectManagerId != null
        ? {
            id: row.projectManagerId,
            name: row.projectManagerName?.trim()
              ? row.projectManagerName.trim()
              : 'Sin nombre',
          }
        : {
            id: 0,
            name: 'Sin investigador principal',
          }),
      ...(row.principalParticipationStartDate?.trim()
        ? { participationStartDate: row.principalParticipationStartDate.trim() }
        : {}),
      ...(row.principalParticipationEndDate?.trim()
        ? { participationEndDate: row.principalParticipationEndDate.trim() }
        : {}),
    };

    const unit =
      row.unitId != null
        ? {
            id: row.unitId,
            name: row.unitName?.trim() ? row.unitName.trim() : 'Sin nombre',
          }
        : {
            id: 0,
            name: 'Sin unidad asignada',
          };

    return {
      id: row.id,
      projectManager,
      code: row.code,
      name: row.name,
      keywords,
      projectType: row.projectType ?? '',
      fundingType: row.fundingType ?? '',
      researchType: row.researchType ?? '',
      status: row.status ?? '',
      startDate: row.startDate ?? '',
      endDate: row.endDate ?? '',
      description: row.description ?? '',
      unit,
      disciplines,
      associatedProfiles,
    };
  }
}
