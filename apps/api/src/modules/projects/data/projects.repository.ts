import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../common/database/database.service';
import type {
  ProjectsFilterOptionDto,
  ProjectsFiltersDto,
  ProjectsFiltersRequestDto,
} from '../projects.reader.contract';
import type { Project, ProjectAssociatedProfile, ProjectDetail } from '../project.entity';

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

type ProjectDetailRow = ProjectRow & {
  description: string;
  unitId: number;
  unitName: string;
};

type ProjectDisciplineRow = {
  description: string;
};

type ProjectKeywordRow = {
  description: string;
};

type ProjectKeywordByProjectRow = {
  projectId: number;
  description: string;
};

type ProjectAssociatedProfileRow = {
  id: number;
  name: string;
  role: string | null;
};

const PROJECT_MANAGER_NAME_SQL = `TRIM(
  CONCAT(
    Researcher.name,
    ' ',
    Researcher.first_surname,
    CASE
      WHEN Researcher.second_surname = '' THEN ''
      ELSE CONCAT(' ', Researcher.second_surname)
    END
  )
)`;

const BASE_PROJECTS_SELECT = `
  SELECT
    Project.id AS id,
    Researcher.id AS projectManagerId,
    ${PROJECT_MANAGER_NAME_SQL} AS projectManagerName,
    Project.code AS code,
    Project.name AS name,
    Project_Type.description AS projectType,
    Funding_Type.description AS fundingType,
    Research_Type.description AS researchType,
    Project_Status.description AS status,
    Project.start_date AS startDate,
    Project.end_date AS endDate
  FROM Project
  INNER JOIN Researcher ON Project.project_manager = Researcher.id
  INNER JOIN Project_Type ON Project.project_type = Project_Type.id
  INNER JOIN Funding_Type ON Project.funding_type = Funding_Type.id
  INNER JOIN Research_Type ON Project.research_type = Research_Type.id
  INNER JOIN Project_Status ON Project.status = Project_Status.id
`;

const COUNT_PROJECTS_QUERY = `
  SELECT COUNT(*) AS totalCount
  FROM Project
  INNER JOIN Researcher ON Project.project_manager = Researcher.id
  INNER JOIN Project_Type ON Project.project_type = Project_Type.id
  INNER JOIN Funding_Type ON Project.funding_type = Funding_Type.id
  INNER JOIN Research_Type ON Project.research_type = Research_Type.id
  INNER JOIN Project_Status ON Project.status = Project_Status.id
`;

const PROJECT_DETAIL_SELECT = `
  SELECT
    Project.id AS id,
    Researcher.id AS projectManagerId,
    ${PROJECT_MANAGER_NAME_SQL} AS projectManagerName,
    Project.code AS code,
    Project.name AS name,
    Project.description AS description,
    Unit.id AS unitId,
    Unit.name AS unitName,
    Project_Type.description AS projectType,
    Funding_Type.description AS fundingType,
    Research_Type.description AS researchType,
    Project_Status.description AS status,
    Project.start_date AS startDate,
    Project.end_date AS endDate
  FROM Project
  INNER JOIN Researcher ON Project.project_manager = Researcher.id
  INNER JOIN Unit ON Project.base_unit = Unit.id
  INNER JOIN Project_Type ON Project.project_type = Project_Type.id
  INNER JOIN Funding_Type ON Project.funding_type = Funding_Type.id
  INNER JOIN Research_Type ON Project.research_type = Research_Type.id
  INNER JOIN Project_Status ON Project.status = Project_Status.id
`;

const PROJECT_DISCIPLINES_SELECT = `
  SELECT Project_Discipline.description AS description
  FROM Project_Discipline_Relation
  INNER JOIN Project_Discipline
    ON Project_Discipline_Relation.discipline_id = Project_Discipline.id
`;

const PROJECT_KEYWORDS_SELECT = `
  SELECT
    Project_Keyword_Relation.project_id AS projectId,
    Project_Keyword.description AS description
  FROM Project_Keyword_Relation
  INNER JOIN Project_Keyword
    ON Project_Keyword_Relation.keyword_id = Project_Keyword.id
`;

const PROJECT_ASSOCIATED_PROFILES_SELECT = `
  SELECT
    Researcher.id AS id,
    ${PROJECT_MANAGER_NAME_SQL} AS name,
    Project_Researcher.role AS role
  FROM Project_Researcher
  INNER JOIN Researcher ON Project_Researcher.researcher_id = Researcher.id
`;

const SEARCH_PROJECTS_WHERE = `
  WHERE LOWER(Project.code) LIKE LOWER(?)
     OR LOWER(Project.name) LIKE LOWER(?)
`;

type BuiltWhereClause = {
  clause: string;
  params: string[];
};

type FilterField = keyof ProjectsFiltersRequestDto;

@Injectable()
export class ProjectsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findFilterOptions(
    searchTerm?: string,
    filters?: ProjectsFiltersRequestDto,
  ): Promise<ProjectsFiltersDto> {
    const researchTypeWhere = this.buildWhereClause(searchTerm, filters, [
      'researchType',
    ]);
    const projectTypeWhere = this.buildWhereClause(searchTerm, filters, ['projectType']);
    const startYearWhere = this.buildWhereClause(searchTerm, filters, ['startYear']);
    const statusWhere = this.buildWhereClause(searchTerm, filters, ['status']);
    const participantsWhere = this.buildWhereClause(searchTerm, filters, [
      'participants',
    ]);
    const keywordsWhere = this.buildWhereClause(searchTerm, filters, ['keywords']);

    const [researchType, projectType, startYear, status, participants, keywords] =
      await Promise.all([
        this.findDistinctFilterOptions(
          `
          SELECT Research_Type.description AS label,
               LOWER(Research_Type.description) AS optionValue,
               COUNT(*) AS optionCount
          FROM Project
          INNER JOIN Researcher ON Project.project_manager = Researcher.id
          INNER JOIN Project_Type ON Project.project_type = Project_Type.id
          INNER JOIN Funding_Type ON Project.funding_type = Funding_Type.id
          INNER JOIN Research_Type ON Project.research_type = Research_Type.id
          INNER JOIN Project_Status ON Project.status = Project_Status.id
          ${researchTypeWhere.clause}
          GROUP BY Research_Type.description
          ORDER BY Research_Type.description ASC
        `,
          researchTypeWhere.params,
        ),
        this.findDistinctFilterOptions(
          `
          SELECT Project_Type.description AS label,
               LOWER(Project_Type.description) AS optionValue,
               COUNT(*) AS optionCount
          FROM Project
          INNER JOIN Researcher ON Project.project_manager = Researcher.id
          INNER JOIN Project_Type ON Project.project_type = Project_Type.id
          INNER JOIN Funding_Type ON Project.funding_type = Funding_Type.id
          INNER JOIN Research_Type ON Project.research_type = Research_Type.id
          INNER JOIN Project_Status ON Project.status = Project_Status.id
          ${projectTypeWhere.clause}
          GROUP BY Project_Type.description
          ORDER BY Project_Type.description ASC
        `,
          projectTypeWhere.params,
        ),
        this.findDistinctFilterOptions(
          `
          SELECT SUBSTR(Project.start_date, 1, 4) AS label,
               SUBSTR(Project.start_date, 1, 4) AS optionValue,
               COUNT(*) AS optionCount
          FROM Project
          INNER JOIN Researcher ON Project.project_manager = Researcher.id
          INNER JOIN Project_Type ON Project.project_type = Project_Type.id
          INNER JOIN Funding_Type ON Project.funding_type = Funding_Type.id
          INNER JOIN Research_Type ON Project.research_type = Research_Type.id
          INNER JOIN Project_Status ON Project.status = Project_Status.id
          ${startYearWhere.clause}
          GROUP BY SUBSTR(Project.start_date, 1, 4)
          ORDER BY SUBSTR(Project.start_date, 1, 4) DESC
        `,
          startYearWhere.params,
        ),
        this.findDistinctFilterOptions(
          `
          SELECT Project_Status.description AS label,
               LOWER(Project_Status.description) AS optionValue,
               COUNT(*) AS optionCount
          FROM Project
          INNER JOIN Researcher ON Project.project_manager = Researcher.id
          INNER JOIN Project_Type ON Project.project_type = Project_Type.id
          INNER JOIN Funding_Type ON Project.funding_type = Funding_Type.id
          INNER JOIN Research_Type ON Project.research_type = Research_Type.id
          INNER JOIN Project_Status ON Project.status = Project_Status.id
          ${statusWhere.clause}
          GROUP BY Project_Status.description
          ORDER BY Project_Status.description ASC
        `,
          statusWhere.params,
        ),
        this.findDistinctFilterOptions(
          `
          SELECT ${PROJECT_MANAGER_NAME_SQL} AS label,
            LOWER(${PROJECT_MANAGER_NAME_SQL}) AS optionValue,
            COUNT(*) AS optionCount
          FROM Project
          INNER JOIN Researcher ON Project.project_manager = Researcher.id
          INNER JOIN Project_Type ON Project.project_type = Project_Type.id
          INNER JOIN Funding_Type ON Project.funding_type = Funding_Type.id
          INNER JOIN Research_Type ON Project.research_type = Research_Type.id
          INNER JOIN Project_Status ON Project.status = Project_Status.id
          ${participantsWhere.clause}
          GROUP BY ${PROJECT_MANAGER_NAME_SQL}
          ORDER BY label ASC
        `,
          participantsWhere.params,
        ),
        this.findKeywordFilterOptions(keywordsWhere),
      ]);

    return {
      researchType,
      projectType,
      startYear,
      status,
      participants,
      keywords,
    };
  }

  async findPaginated(
    page: number,
    limit: number,
    searchTerm?: string | null,
    filters?: ProjectsFiltersRequestDto,
  ): Promise<PaginatedResult<Project>> {
    const offset = this.calculateOffset(page, limit);
    const builtWhereClause = this.buildWhereClause(searchTerm, filters);
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
    const numericId = Number(id);

    if (!Number.isInteger(numericId)) {
      return null;
    }

    const rows = await this.databaseService.query<ProjectDetailRow>(
      `${PROJECT_DETAIL_SELECT} WHERE Project.id = ?`,
      [numericId],
    );

    const row = rows[0];

    if (!row) {
      return null;
    }

    const [associatedProfiles, disciplines, keywords] = await Promise.all([
      this.findAssociatedProfiles(numericId),
      this.findDisciplines(numericId),
      this.findKeywords(numericId),
    ]);

    return this.mapRowToProjectDetail(row, associatedProfiles, disciplines, keywords);
  }

  private async findItemsPage(
    limit: number,
    offset: number,
    builtWhereClause: BuiltWhereClause,
  ): Promise<Project[]> {
    const rows = await this.databaseService.query<ProjectRow>(
      `
        ${BASE_PROJECTS_SELECT}
        ${builtWhereClause.clause}
        ORDER BY Project.name ASC
        LIMIT ${limit} OFFSET ${offset}
      `,
      builtWhereClause.params,
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

  private async countProjects(builtWhereClause: BuiltWhereClause): Promise<number> {
    const totalRows = await this.databaseService.query<ProjectCountRow>(
      `
        ${COUNT_PROJECTS_QUERY}
        ${builtWhereClause.clause}
      `,
      builtWhereClause.params,
    );

    return totalRows[0]?.totalCount ?? 0;
  }

  private async findAssociatedProfiles(
    projectId: number,
  ): Promise<ProjectAssociatedProfile[]> {
    const rows = await this.databaseService.query<ProjectAssociatedProfileRow>(
      `${PROJECT_ASSOCIATED_PROFILES_SELECT} WHERE Project_Researcher.project_id = ? ORDER BY Researcher.id ASC`,
      [projectId],
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      ...(row.role ? { role: row.role } : {}),
    }));
  }

  private async findDisciplines(projectId: number): Promise<string[]> {
    const rows = await this.databaseService.query<ProjectDisciplineRow>(
      `${PROJECT_DISCIPLINES_SELECT} WHERE Project_Discipline_Relation.project_id = ? ORDER BY Project_Discipline.description ASC`,
      [projectId],
    );

    return rows.map((row) => row.description);
  }

  private async findKeywords(projectId: number): Promise<string[]> {
    const rows = await this.databaseService.query<ProjectKeywordRow>(
      `${PROJECT_KEYWORDS_SELECT} WHERE Project_Keyword_Relation.project_id = ? ORDER BY Project_Keyword.description ASC`,
      [projectId],
    );

    return rows.map((row) => row.description);
  }

  private async findKeywordsByProjectIds(
    projectIds: number[],
  ): Promise<Map<number, string[]>> {
    if (projectIds.length === 0) {
      return new Map<number, string[]>();
    }

    const placeholders = projectIds.map(() => '?').join(', ');
    const rows = await this.databaseService.query<ProjectKeywordByProjectRow>(
      `${PROJECT_KEYWORDS_SELECT} WHERE Project_Keyword_Relation.project_id IN (${placeholders}) ORDER BY Project_Keyword_Relation.project_id ASC, Project_Keyword.description ASC`,
      projectIds,
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

  private buildInClause(columnSql: string, values: string[]): string {
    const placeholders = values.map(() => '?').join(', ');
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
    params: string[] = [],
  ): Promise<ProjectsFilterOptionDto[]> {
    const rows = await this.databaseService.query<ProjectFilterValueRow>(query, params);
    return rows.map((row) => ({
      label: row.label,
      value: this.normalizeFacetValue(row.optionValue, row.label),
      count: row.optionCount,
    }));
  }

  private async findKeywordFilterOptions(
    builtWhereClause: BuiltWhereClause,
  ): Promise<ProjectsFilterOptionDto[]> {
    const rows = await this.databaseService.query<ProjectFilterValueRow>(
      `
      SELECT Project_Keyword.description AS label,
        LOWER(Project_Keyword.description) AS optionValue,
        COUNT(*) AS optionCount
      FROM Project
      INNER JOIN Researcher ON Project.project_manager = Researcher.id
      INNER JOIN Project_Type ON Project.project_type = Project_Type.id
      INNER JOIN Funding_Type ON Project.funding_type = Funding_Type.id
      INNER JOIN Research_Type ON Project.research_type = Research_Type.id
      INNER JOIN Project_Status ON Project.status = Project_Status.id
      INNER JOIN Project_Keyword_Relation
        ON Project_Keyword_Relation.project_id = Project.id
      INNER JOIN Project_Keyword
        ON Project_Keyword_Relation.keyword_id = Project_Keyword.id
      ${builtWhereClause.clause}
      GROUP BY Project_Keyword.description
      ORDER BY Project_Keyword.description ASC
    `,
      builtWhereClause.params,
    );

    return rows.map((row) => ({
      label: this.toTitleCase(row.label),
      value: this.normalizeFacetValue(row.optionValue, row.label),
      count: row.optionCount,
    }));
  }

  private normalizeFacetValue(value: string | undefined, fallbackLabel: string): string {
    const normalizedValue = value?.trim();
    return normalizedValue ? normalizedValue : fallbackLabel;
  }

  private shouldSkipFilter(field: FilterField, excludedFilters: FilterField[]): boolean {
    return excludedFilters.includes(field);
  }

  private buildWhereClause(
    searchTerm?: string | null,
    filters?: ProjectsFiltersRequestDto,
    excludedFilters: FilterField[] = [],
  ): BuiltWhereClause {
    const clauses: string[] = [];
    const params: string[] = [];

    const normalizedSearchTerm = this.normalizeSearchTerm(searchTerm);
    if (normalizedSearchTerm) {
      clauses.push(`(${SEARCH_PROJECTS_WHERE.trim().replace(/^WHERE\s+/i, '')})`);
      params.push(normalizedSearchTerm, normalizedSearchTerm);
    }

    const researchTypes = this.normalizeFilterValues(filters?.researchType);
    if (
      !this.shouldSkipFilter('researchType', excludedFilters) &&
      researchTypes.length > 0
    ) {
      clauses.push(this.buildInClause('LOWER(Research_Type.description)', researchTypes));
      params.push(...researchTypes);
    }

    const projectTypes = this.normalizeFilterValues(filters?.projectType);
    if (
      !this.shouldSkipFilter('projectType', excludedFilters) &&
      projectTypes.length > 0
    ) {
      clauses.push(this.buildInClause('LOWER(Project_Type.description)', projectTypes));
      params.push(...projectTypes);
    }

    const startYears = this.normalizeFilterValues(filters?.startYear);
    if (!this.shouldSkipFilter('startYear', excludedFilters) && startYears.length > 0) {
      clauses.push(this.buildInClause('SUBSTR(Project.start_date, 1, 4)', startYears));
      params.push(...startYears);
    }

    const statuses = this.normalizeFilterValues(filters?.status);
    if (!this.shouldSkipFilter('status', excludedFilters) && statuses.length > 0) {
      clauses.push(this.buildInClause('LOWER(Project_Status.description)', statuses));
      params.push(...statuses);
    }

    const participants = this.normalizeFilterValues(filters?.participants);
    if (
      !this.shouldSkipFilter('participants', excludedFilters) &&
      participants.length > 0
    ) {
      clauses.push(
        this.buildInClause(`LOWER(${PROJECT_MANAGER_NAME_SQL})`, participants),
      );
      params.push(...participants);
    }

    const keywords = this.normalizeFilterValues(filters?.keywords);
    if (!this.shouldSkipFilter('keywords', excludedFilters) && keywords.length > 0) {
      clauses.push(this.buildKeywordsLikeClause(keywords));
      params.push(...keywords.map((keyword) => `%${keyword}%`));
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

  private toTitleCase(value: string): string {
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
    return {
      ...this.mapRowToProject(row, keywords),
      description: row.description,
      unit: {
        id: row.unitId,
        name: row.unitName,
      },
      disciplines,
      associatedProfiles,
    };
  }
}
