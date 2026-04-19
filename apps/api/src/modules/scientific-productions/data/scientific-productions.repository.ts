import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../common/database/database.service';
import type { ScientificProduction } from '../scientific-production.entity';

type PaginatedResult<T> = {
  items: T[];
  total: number;
};

type ScientificProductionCountRow = {
  totalCount: number;
};

/*
  id: number;
  title: string;
  type: string;
  source: number;
  openAccess: boolean;
  publicationYear: number;
  // abstract: string;
  doi: string;
  citationCount: number;
*/
// TODO: Hacer estas consultas.
const BASE_SCIENTIFIC_PRODUCTIONS_SELECT = `
  SELECT
    ScientificProduction.id AS id,
    ScientificProduction.title AS title,
    ScientificProduction.authors AS authors,
    ScientificProduction.principal_author AS principalAuthor,
    ScientificProduction.unit AS unit,
    ScientificProduction.affiliations AS affiliations,
    ScientificProduction.type AS type,
    ScientificProduction.open_access AS openAccess,
    ScientificProduction.publication_year AS publicationYear,
    ScientificProduction.abstract AS abstract,
    ScientificProduction.doi AS doi,
    ScientificProduction.journal AS journal,
    ScientificProduction.volume AS volume,
    ScientificProduction.issue AS issue,
    ScientificProduction.pages AS pages,
    ScientificProduction.citation_count AS citationCount,
    ScientificProduction.keywords AS keywords
  FROM ScientificProduction
  `;

const SUMMARY_SCIENTIFIC_PRODUCTIONS_SELECT = `
  SELECT
    ScientificProduction.id AS id,
    ScientificProduction.title AS title,
    ScientificProduction.authors AS authors,
    ScientificProduction.type AS type,
    ScientificProduction.open_access AS openAccess,
    ScientificProduction.publication_year AS publicationYear,
    ScientificProduction.doi AS doi,
    ScientificProduction.journal AS journal,
    ScientificProduction.volume AS volume,
    ScientificProduction.issue AS issue,
    ScientificProduction.pages AS pages,
    ScientificProduction.keywords AS keywords
  FROM ScientificProduction
  `;

const COUNT_SCIENTIFIC_PRODUCTIONS_QUERY = `
  SELECT COUNT(*) AS totalCount
  FROM ScientificProduction
  `;

@Injectable()
export class ScientificProductionRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findPaginated(
    page: number,
    limit: number,
  ): Promise<PaginatedResult<ScientificProduction>> {
    const offset = this.calculateOffset(page, limit);
    const [items, total] = await Promise.all([
      this.findItemsPage(limit, offset),
      this.countScientificProductions(),
    ]);

    return {
      items,
      total,
    };
  }

  async findById(id: string): Promise<ScientificProduction | null> {
    const rows = await this.databaseService.query<ScientificProduction>(
      `${BASE_SCIENTIFIC_PRODUCTIONS_SELECT} WHERE ScientificProduction.id = ?`,
      [id],
    );
    return rows[0] ?? null;
  }

  private async findItemsPage(
    limit: number,
    offset: number,
  ): Promise<ScientificProduction[]> {
    return this.databaseService.query<ScientificProduction>(
      `
        ${SUMMARY_SCIENTIFIC_PRODUCTIONS_SELECT}
        ORDER BY ScientificProduction.id ASC
        LIMIT ${limit} OFFSET ${offset}
      `,
    );
  }

  private async countScientificProductions(): Promise<number> {
    const totalRows = await this.databaseService.query<ScientificProductionCountRow>(
      COUNT_SCIENTIFIC_PRODUCTIONS_QUERY,
    );

    return totalRows[0]?.totalCount ?? 0;
  }

  private calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }
}
