import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../common/database/database.service';
import type { Project } from '../project.entity';
import type { ProjectsFiltersRequestDto } from '../projects.reader.contract';

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
  keywords: string;
  projectType: string;
  fundingType: string;
  researchType: string;
  status: string;
  startDate: string;
  endDate: string;
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
    Project.keywords AS keywords,
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

const SEARCH_PROJECTS_WHERE = `
  WHERE LOWER(Project.code) LIKE LOWER(?)
     OR LOWER(Project.name) LIKE LOWER(?)
`;

type BuiltWhereClause = {
  clause: string;
  params: string[];
};

@Injectable()
export class ProjectsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

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

    return rows.map((row) => this.mapRowToProject(row));
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
    const clauses = values.map(() => 'LOWER(Project.keywords) LIKE ?').join(' OR ');
    return `(${clauses})`;
  }

  private buildWhereClause(
    searchTerm?: string | null,
    filters?: ProjectsFiltersRequestDto,
  ): BuiltWhereClause {
    const clauses: string[] = [];
    const params: string[] = [];

    const normalizedSearchTerm = this.normalizeSearchTerm(searchTerm);
    if (normalizedSearchTerm) {
      clauses.push(`(${SEARCH_PROJECTS_WHERE.trim().replace(/^WHERE\s+/i, '')})`);
      params.push(normalizedSearchTerm, normalizedSearchTerm);
    }

    const researchTypes = this.normalizeFilterValues(filters?.researchType);
    if (researchTypes.length > 0) {
      clauses.push(this.buildInClause('LOWER(Research_Type.description)', researchTypes));
      params.push(...researchTypes);
    }

    const projectTypes = this.normalizeFilterValues(filters?.projectType);
    if (projectTypes.length > 0) {
      clauses.push(this.buildInClause('LOWER(Project_Type.description)', projectTypes));
      params.push(...projectTypes);
    }

    const startYears = this.normalizeFilterValues(filters?.startYear);
    if (startYears.length > 0) {
      clauses.push(this.buildInClause('SUBSTR(Project.start_date, 1, 4)', startYears));
      params.push(...startYears);
    }

    const statuses = this.normalizeFilterValues(filters?.status);
    if (statuses.length > 0) {
      clauses.push(this.buildInClause('LOWER(Project_Status.description)', statuses));
      params.push(...statuses);
    }

    const participants = this.normalizeFilterValues(filters?.participants);
    if (participants.length > 0) {
      clauses.push(
        this.buildInClause(`LOWER(${PROJECT_MANAGER_NAME_SQL})`, participants),
      );
      params.push(...participants);
    }

    const keywords = this.normalizeFilterValues(filters?.keywords);
    if (keywords.length > 0) {
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

  private mapRowToProject(row: ProjectRow): Project {
    return {
      id: row.id,
      projectManager: {
        id: row.projectManagerId,
        name: row.projectManagerName,
      },
      code: row.code,
      name: row.name,
      keywords: this.parseKeywords(row.keywords),
      projectType: row.projectType,
      fundingType: row.fundingType,
      researchType: row.researchType,
      status: row.status,
      startDate: row.startDate,
      endDate: row.endDate,
    };
  }

  private parseKeywords(rawKeywords: string): string[] {
    return rawKeywords
      .split(',')
      .map((keyword) => keyword.trim())
      .filter(Boolean);
  }
}
