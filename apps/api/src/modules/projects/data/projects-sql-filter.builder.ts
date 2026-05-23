import type { ProjectsFiltersRequestDto } from '../projects.reader.contract';
import {
  PROFILE_FULL_NAME_SQL,
  PROJECT_FILTER_BASIC_JOIN_BASE_WITHOUT_PERIOD,
  PROJECT_FILTER_PARTICIPANTS_JOIN_SUFFIX,
  PROJECT_FILTER_START_DATES_JOIN,
  PROJECT_START_DATES_CTE,
  SEARCH_PROJECTS_WHERE,
} from './projects.queries';
import type {
  BindAccumulator,
  BuiltNamedWhereClause,
  BuiltPaginatedProjectsWhereClause,
  FilterField,
} from './projects.repository.types';

type InFilterOptions = {
  columnSql: string;
  exactMatch?: boolean;
};

type ParticipantsFilterOptions = {
  profileAlias: string;
  exactMatch?: boolean;
  existsSql?: string;
};

type KeywordsFilterOptions = {
  projectAlias: string;
  keywordAlias: string;
};

export class ProjectsSqlFilterBuilder {
  buildFilterOptionsWhereClause(
    searchTerm?: string | null,
    filters?: ProjectsFiltersRequestDto,
    excludedFilters: FilterField[] = [],
  ): BuiltNamedWhereClause {
    const clauses: string[] = [];
    const bindAccumulator: BindAccumulator = { nextIndex: 0, params: {} };

    this.addFilterOptionsSearchClause(clauses, bindAccumulator, searchTerm);
    this.addResearchTypeFilterClause(clauses, bindAccumulator, filters, excludedFilters, {
      columnSql: 'LOWER(research_type_lookup.PROJECT_RESEARCH_TYPE_NAME)',
      exactMatch: true,
    });
    this.addProjectTypeFilterClause(clauses, bindAccumulator, filters, excludedFilters, {
      columnSql: 'LOWER(project_type_lookup.PROJECT_TYPE_NAME)',
      exactMatch: true,
    });
    this.addStatusFilterClause(clauses, bindAccumulator, filters, excludedFilters, {
      columnSql: 'LOWER(status_lookup.PROJECT_STATUS_NAME)',
      exactMatch: true,
    });
    this.addParticipantsFilterClause(clauses, bindAccumulator, filters, excludedFilters, {
      profileAlias: 'member_profile',
      exactMatch: true,
    });
    this.addKeywordsFilterClause(clauses, bindAccumulator, filters, excludedFilters, {
      projectAlias: 'research_project',
      keywordAlias: 'keyword',
    });
    this.addFilterOptionsStartYearClause(
      clauses,
      bindAccumulator,
      filters,
      excludedFilters,
    );

    return this.buildWhereClause(clauses, bindAccumulator.params);
  }

  buildPaginatedProjectsWhereClause(
    searchTerm?: string | null,
    filters?: ProjectsFiltersRequestDto,
    excludedFilters: FilterField[] = [],
  ): BuiltPaginatedProjectsWhereClause {
    const clauses: string[] = [];
    const bindAccumulator: BindAccumulator = { nextIndex: 0, params: {} };

    this.addPaginatedSearchClause(clauses, bindAccumulator, searchTerm);
    this.addResearchTypeFilterClause(clauses, bindAccumulator, filters, excludedFilters, {
      columnSql: 'LOWER(research_type_lookup.PROJECT_RESEARCH_TYPE_NAME)',
    });
    this.addProjectTypeFilterClause(clauses, bindAccumulator, filters, excludedFilters, {
      columnSql: 'LOWER(project_type_lookup.PROJECT_TYPE_NAME)',
    });
    this.addPaginatedStartYearClause(clauses, bindAccumulator, filters, excludedFilters);
    this.addStatusFilterClause(clauses, bindAccumulator, filters, excludedFilters, {
      columnSql: 'LOWER(status_lookup.PROJECT_STATUS_NAME)',
    });
    this.addParticipantsFilterClause(clauses, bindAccumulator, filters, excludedFilters, {
      profileAlias: 'profile',
      existsSql: `
        EXISTS (
          SELECT 1
          FROM UCR_PROFILE_PROJECT_UNIT uppu
          INNER JOIN PROFILE profile
            ON uppu.PROFILE_ID = profile.PROFILE_ID
          WHERE uppu.PROJECT_ID = research_project.PROJECT_ID
            AND (%conditions%)
        )
      `,
    });
    this.addKeywordsFilterClause(clauses, bindAccumulator, filters, excludedFilters, {
      projectAlias: 'research_project',
      keywordAlias: 'keyword',
    });

    return this.buildWhereClause(clauses, bindAccumulator.params);
  }

  buildFilterOptionsJoinBase(
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

  buildFilterOptionsCte(
    filters?: ProjectsFiltersRequestDto,
    excludedFilters: FilterField[] = [],
  ): string {
    const shouldIncludePeriod =
      this.normalizeFilterValues(filters?.startYear).length > 0 &&
      !this.shouldSkipFilter('startYear', excludedFilters);

    return shouldIncludePeriod ? `${PROJECT_START_DATES_CTE.trimEnd()}\n` : '';
  }

  buildParticipantsFilterOptionsQuery(
    builtWhereClause: BuiltNamedWhereClause,
    filters?: ProjectsFiltersRequestDto,
  ): string {
    const startDateCte = this.buildFilterOptionsCte(filters, ['participants']).trim();
    const ctePrefix = startDateCte ? `${startDateCte.replace(/^WITH\s+/i, '')}, ` : '';
    const participantNameSql = PROFILE_FULL_NAME_SQL('member_profile');

    return `
      WITH ${ctePrefix}filtered_projects AS (
        SELECT /*+ MATERIALIZE */ DISTINCT research_project.PROJECT_ID
        ${this.buildFilterOptionsJoinBase(filters, ['participants'])}
        ${builtWhereClause.clause}
      ),
      participant_counts AS (
        SELECT
          member_participation.PROFILE_ID,
          COUNT(DISTINCT member_participation.PROJECT_ID) AS optionCount
        FROM UCR_PROFILE_PROJECT_UNIT member_participation
        INNER JOIN filtered_projects
          ON filtered_projects.PROJECT_ID = member_participation.PROJECT_ID
        GROUP BY member_participation.PROFILE_ID
      )
      SELECT
        ${participantNameSql} AS "label",
        LOWER(${participantNameSql}) AS "optionValue",
        participant_counts.optionCount AS "optionCount"
      FROM participant_counts
      INNER JOIN PROFILE member_profile
        ON participant_counts.PROFILE_ID = member_profile.PROFILE_ID
      GROUP BY
        ${participantNameSql},
        participant_counts.optionCount
      ORDER BY "label" ASC
    `;
  }

  normalizeFilterValues(values?: string[]): string[] {
    return Array.from(
      new Set((values ?? []).map((value) => value.trim().toLowerCase()).filter(Boolean)),
    );
  }

  private addFilterOptionsSearchClause(
    clauses: string[],
    bindAccumulator: BindAccumulator,
    searchTerm?: string | null,
  ): void {
    const normalizedSearchTerm = this.normalizeSearchTerm(searchTerm);
    if (!normalizedSearchTerm) {
      return;
    }

    const codeBind = this.addBind(
      bindAccumulator,
      'searchTermCode',
      normalizedSearchTerm,
    );
    const nameBind = this.addBind(
      bindAccumulator,
      'searchTermName',
      normalizedSearchTerm,
    );
    clauses.push(
      `(LOWER(TO_CHAR(research_project.PROJECT_ID)) LIKE LOWER(${codeBind}) OR LOWER(research_project.PROJECT_NAME) LIKE LOWER(${nameBind}))`,
    );
  }

  private addPaginatedSearchClause(
    clauses: string[],
    bindAccumulator: BindAccumulator,
    searchTerm?: string | null,
  ): void {
    const normalizedSearchTerm = this.normalizeSearchTerm(searchTerm);
    if (!normalizedSearchTerm) {
      return;
    }

    clauses.push(`(${SEARCH_PROJECTS_WHERE.trim().replace(/^WHERE\s+/i, '')})`);
    bindAccumulator.params.searchTerm = normalizedSearchTerm;
  }

  private addFilterOptionsStartYearClause(
    clauses: string[],
    bindAccumulator: BindAccumulator,
    filters?: ProjectsFiltersRequestDto,
    excludedFilters: FilterField[] = [],
  ): void {
    const startYears = this.normalizeFilterValues(filters?.startYear);
    if (this.shouldSkipFilter('startYear', excludedFilters) || startYears.length === 0) {
      return;
    }

    const binds = startYears.map((startYear) =>
      this.addBind(bindAccumulator, 'startYear', startYear),
    );
    clauses.push(
      `TO_CHAR(project_start_dates.PROJECT_START_DATE, 'YYYY') IN (${binds.join(', ')})`,
    );
  }

  private addPaginatedStartYearClause(
    clauses: string[],
    bindAccumulator: BindAccumulator,
    filters?: ProjectsFiltersRequestDto,
    excludedFilters: FilterField[] = [],
  ): void {
    const startYears = this.normalizeFilterValues(filters?.startYear);
    if (this.shouldSkipFilter('startYear', excludedFilters) || startYears.length === 0) {
      return;
    }

    const binds = startYears.map((startYear) =>
      this.addBind(bindAccumulator, 'startYear', startYear),
    );
    clauses.push(
      `TO_CHAR(project_period_aggregate.AGGREGATE_START_DATE, 'YYYY') IN (${binds.join(', ')})`,
    );
  }

  private addResearchTypeFilterClause(
    clauses: string[],
    bindAccumulator: BindAccumulator,
    filters: ProjectsFiltersRequestDto | undefined,
    excludedFilters: FilterField[],
    options: InFilterOptions,
  ): void {
    this.addSimpleInFilterClause(
      clauses,
      bindAccumulator,
      filters?.researchType,
      'researchType',
      excludedFilters,
      options.columnSql,
      options.exactMatch,
    );
  }

  private addProjectTypeFilterClause(
    clauses: string[],
    bindAccumulator: BindAccumulator,
    filters: ProjectsFiltersRequestDto | undefined,
    excludedFilters: FilterField[],
    options: InFilterOptions,
  ): void {
    this.addSimpleInFilterClause(
      clauses,
      bindAccumulator,
      filters?.projectType,
      'projectType',
      excludedFilters,
      options.columnSql,
      options.exactMatch,
    );
  }

  private addStatusFilterClause(
    clauses: string[],
    bindAccumulator: BindAccumulator,
    filters: ProjectsFiltersRequestDto | undefined,
    excludedFilters: FilterField[],
    options: InFilterOptions,
  ): void {
    this.addSimpleInFilterClause(
      clauses,
      bindAccumulator,
      filters?.status,
      'status',
      excludedFilters,
      options.columnSql,
      options.exactMatch,
    );
  }

  private addSimpleInFilterClause(
    clauses: string[],
    bindAccumulator: BindAccumulator,
    rawValues: string[] | undefined,
    field: FilterField,
    excludedFilters: FilterField[],
    columnSql: string,
    exactMatch = false,
  ): void {
    const values = this.normalizeFilterValues(rawValues);
    if (this.shouldSkipFilter(field, excludedFilters) || values.length === 0) {
      return;
    }

    if (exactMatch) {
      const binds = values.map((value) => this.addBind(bindAccumulator, field, value));
      clauses.push(`${columnSql} IN (${binds.join(', ')})`);
      return;
    }

    const binds = values.map((value) => this.addBind(bindAccumulator, field, value));
    clauses.push(`${columnSql} IN (${binds.join(', ')})`);
  }

  private addParticipantsFilterClause(
    clauses: string[],
    bindAccumulator: BindAccumulator,
    filters: ProjectsFiltersRequestDto | undefined,
    excludedFilters: FilterField[],
    options: ParticipantsFilterOptions,
  ): void {
    const participants = this.normalizeFilterValues(filters?.participants);
    if (
      this.shouldSkipFilter('participants', excludedFilters) ||
      participants.length === 0
    ) {
      return;
    }

    const fullNameSql = `LOWER(${PROFILE_FULL_NAME_SQL(options.profileAlias)})`;

    if (options.exactMatch) {
      const binds = participants.map((participant) =>
        this.addBind(bindAccumulator, 'participant', participant),
      );
      clauses.push(`${fullNameSql} IN (${binds.join(', ')})`);
      return;
    }

    const participantClauses = participants.map(
      (_, index) => `${fullNameSql} = :participant${index}`,
    );

    clauses.push(
      options.existsSql?.replace('%conditions%', participantClauses.join(' OR ')) ?? '',
    );

    participants.forEach((value, index) => {
      bindAccumulator.params[`participant${index}`] = value;
    });
  }

  private addKeywordsFilterClause(
    clauses: string[],
    bindAccumulator: BindAccumulator,
    filters: ProjectsFiltersRequestDto | undefined,
    excludedFilters: FilterField[],
    options: KeywordsFilterOptions,
  ): void {
    const keywords = this.normalizeFilterValues(filters?.keywords);
    if (this.shouldSkipFilter('keywords', excludedFilters) || keywords.length === 0) {
      return;
    }

    const keywordClauses = keywords.map((keyword) => {
      const bind = this.addBind(bindAccumulator, 'keyword', `%${keyword}%`);
      return `LOWER(${options.keywordAlias}.KEYWORD) LIKE ${bind}`;
    });

    clauses.push(`EXISTS (
      SELECT 1
      FROM PROJECT_KEYWORD project_keyword_link
      INNER JOIN KEYWORD ${options.keywordAlias}
        ON project_keyword_link.KEYWORD_ID = ${options.keywordAlias}.KEYWORD_ID
      WHERE project_keyword_link.PROJECT_ID = ${options.projectAlias}.PROJECT_ID
        AND (${keywordClauses.join(' OR ')})
    )`);
  }

  private addBind(
    bindAccumulator: BindAccumulator,
    prefix: string,
    value: unknown,
  ): string {
    const bindName = `${prefix}${bindAccumulator.nextIndex}`;
    bindAccumulator.nextIndex += 1;
    bindAccumulator.params[bindName] = value;
    return `:${bindName}`;
  }

  private buildWhereClause(
    clauses: string[],
    params: Record<string, unknown>,
  ): BuiltNamedWhereClause {
    return {
      clause: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
      params,
    };
  }

  private normalizeSearchTerm(searchTerm?: string | null): string | null {
    const normalizedSearchTerm = searchTerm?.trim();
    return normalizedSearchTerm ? `%${normalizedSearchTerm}%` : null;
  }

  private shouldSkipFilter(field: FilterField, excludedFilters: FilterField[]): boolean {
    return excludedFilters.includes(field);
  }
}
