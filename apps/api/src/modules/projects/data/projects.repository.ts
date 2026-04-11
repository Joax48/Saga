import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../common/database/database.service';
import type { Project } from '../project.entity';

type PaginatedResult<T> = {
  items: T[];
  total: number;
};

type ProjectCountRow = {
  totalCount: number;
};

const BASE_PROJECTS_SELECT = `
  SELECT
    Project.id AS id,
    Project.code AS code,
    Project.name AS name,
    Project_Type.description AS projectType,
    Funding_Type.description AS fundingType,
    Research_Type.description AS researchType,
    Project_Status.description AS status,
    Project.start_date AS startDate,
    Project.end_date AS endDate
  FROM Project
  INNER JOIN Project_Type ON Project.project_type = Project_Type.id
  INNER JOIN Funding_Type ON Project.funding_type = Funding_Type.id
  INNER JOIN Research_Type ON Project.research_type = Research_Type.id
  INNER JOIN Project_Status ON Project.status = Project_Status.id
`;

const COUNT_PROJECTS_QUERY = `
  SELECT COUNT(*) AS totalCount
  FROM Project
`;

const SEARCH_PROJECTS_WHERE = `
  WHERE LOWER(Project.code) LIKE LOWER(?)
     OR LOWER(Project.name) LIKE LOWER(?)
`;

@Injectable()
export class ProjectsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findPaginated(page: number, limit: number): Promise<PaginatedResult<Project>> {
    const offset = this.calculateOffset(page, limit);
    const [items, total] = await Promise.all([
      this.findItemsPage(limit, offset),
      this.countProjects(),
    ]);

    return {
      items,
      total,
    };
  }

  async searchByNameOrCode(
    query: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<Project>> {
    const offset = this.calculateOffset(page, limit);
    const [items, total] = await Promise.all([
      this.findSearchItemsPage(query, limit, offset),
      this.countSearchProjects(query),
    ]);

    return {
      items,
      total,
    };
  }

  private async findItemsPage(limit: number, offset: number): Promise<Project[]> {
    return this.databaseService.query<Project>(
      `
        ${BASE_PROJECTS_SELECT}
        ORDER BY Project.name ASC
        LIMIT ${limit} OFFSET ${offset}
      `,
    );
  }

  private async countProjects(): Promise<number> {
    const totalRows =
      await this.databaseService.query<ProjectCountRow>(COUNT_PROJECTS_QUERY);

    return totalRows[0]?.totalCount ?? 0;
  }

  private async findSearchItemsPage(
    query: string,
    limit: number,
    offset: number,
  ): Promise<Project[]> {
    const searchTerm = `%${query}%`;

    return this.databaseService.query<Project>(
      `
        ${BASE_PROJECTS_SELECT}
        ${SEARCH_PROJECTS_WHERE}
        ORDER BY Project.name ASC
        LIMIT ${limit} OFFSET ${offset}
      `,
      [searchTerm, searchTerm],
    );
  }

  private async countSearchProjects(query: string): Promise<number> {
    const searchTerm = `%${query}%`;
    const totalRows = await this.databaseService.query<ProjectCountRow>(
      `
        ${COUNT_PROJECTS_QUERY}
        ${SEARCH_PROJECTS_WHERE}
      `,
      [searchTerm, searchTerm],
    );

    return totalRows[0]?.totalCount ?? 0;
  }

  private calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }
}
