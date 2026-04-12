import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../../common/database/database.service';
import type { Researcher } from '../researcher.entity';

type PaginatedResult<T> = {
  items: T[];
  total: number;
};

type ResearcherCountRow = {
  totalCount: number;
};

const BASE_RESEARCHERS_SELECT = `
  SELECT
    Researcher.id AS id,
    Researcher.id_ucr_profile AS idUcrProfile,
    Researcher.base_unit AS baseUnit,
    Researcher.name AS name,
    Researcher.first_surname AS firstSurname,
    Researcher.second_surname AS secondSurname,
    Researcher.cea_category AS ceaCategory,
    Researcher.orcid_id AS orcidId,
    Researcher.linkedin AS linkedin,
    Researcher.research_gate AS researchGate,
    Researcher.scopus AS scopus,
    Researcher.photo_url AS photoUrl
  FROM Researcher
`;

const COUNT_RESEARCHERS_QUERY = `
  SELECT COUNT(*) AS totalCount
  FROM Researcher
`;

@Injectable()
export class ResearchersRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findPaginated(page: number, limit: number, name?: string): Promise<PaginatedResult<Researcher>> {
    const offset = this.calculateOffset(page, limit);
    const [items, total] = await Promise.all([
      this.findItemsPage(limit, offset, name),
      this.countResearchers(name),
    ]);

    return {
      items,
      total,
    };
  }

  private async findItemsPage(limit: number, offset: number, name?: string): Promise<Researcher[]> {
    if (name) {
      return this.databaseService.query<Researcher>(
        `
          ${BASE_RESEARCHERS_SELECT}
          WHERE LOWER(Researcher.name) LIKE ?
          ORDER BY Researcher.first_surname ASC, Researcher.name ASC
          LIMIT ${limit} OFFSET ${offset}
        `,
        [`${name.toLowerCase()}%`],
      );
    }

    return this.databaseService.query<Researcher>(
      `
        ${BASE_RESEARCHERS_SELECT}
        ORDER BY Researcher.name ASC, Researcher.first_surname ASC, Researcher.second_surname ASC
        LIMIT ${limit} OFFSET ${offset}
      `,
    );
  }

  private async countResearchers(name?: string): Promise<number> {
    if (name) {
      const totalRows = await this.databaseService.query<ResearcherCountRow>(
        `
          SELECT COUNT(*) AS totalCount
          FROM Researcher
          WHERE LOWER(Researcher.name) LIKE ?
        `,
        [`${name.toLowerCase()}%`],
      );
      return totalRows[0]?.totalCount ?? 0;
    }

    const totalRows = await this.databaseService.query<ResearcherCountRow>(
      COUNT_RESEARCHERS_QUERY,
    );

    return totalRows[0]?.totalCount ?? 0;
  }

  private calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }
}
