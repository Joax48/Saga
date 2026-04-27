import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../common/database/database.service';
import { ScientificProductionsFiltersDto } from '../scientific-productions.reader.contract';
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
    filters?: ScientificProductionsFiltersDto,
  ): Promise<PaginatedResult<ScientificProduction>> {
    const offset = this.calculateOffset(page, limit);
    const { where, params } = this.buildWhereClause(filters);

    const [items, total] = await Promise.all([
      this.findItemsPage(limit, offset, where, params),
      this.countScientificProductions(where, params),
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

  private buildWhereClause(filters?: ScientificProductionsFiltersDto): {
    where: string;
    params: unknown[];
  } {
    if (!filters) return { where: '', params: [] };

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters.q) {
      conditions.push(`LOWER(ScientificProduction.title) LIKE LOWER(?)`);
      params.push(`%${filters.q}%`);
    }

    if (filters.type) {
      conditions.push(`ScientificProduction.type LIKE ?`);
      params.push(`%"subcategory":"${filters.type}"%`);
    }

    if (filters.openAccess !== undefined) {
      conditions.push(`ScientificProduction.open_access = ?`);
      params.push(filters.openAccess);
    }

    if (filters.year) {
      conditions.push(`ScientificProduction.publication_year = ?`);
      params.push(filters.year);
    }

    if (filters.keywords && filters.keywords.length > 0) {
      if (filters.keywords.length === 1) {
        conditions.push(`ScientificProduction.keywords LIKE ?`);
        params.push(`%${filters.keywords[0]}%`);
      } else {
        const keywordConditions = filters.keywords
          .map(() => 'ScientificProduction.keywords LIKE ?')
          .join(' OR ');
        conditions.push(`(${keywordConditions})`);
        params.push(...filters.keywords.map((k) => `%${k}%`));
      }
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    return { where, params };
  }

  private async findItemsPage(
    limit: number,
    offset: number,
    where: string,
    params: unknown[],
  ): Promise<ScientificProduction[]> {
    return this.databaseService.query<ScientificProduction>(
      `
        ${SUMMARY_SCIENTIFIC_PRODUCTIONS_SELECT}
        ${where}
        ORDER BY ScientificProduction.id ASC
        LIMIT ${limit} OFFSET ${offset}
      `,
      params,
    );
  }

  private async countScientificProductions(
    where: string,
    params: unknown[],
  ): Promise<number> {
    const totalRows = await this.databaseService.query<ScientificProductionCountRow>(
      `${COUNT_SCIENTIFIC_PRODUCTIONS_QUERY} ${where}`,
      params,
    );

    return totalRows[0]?.totalCount ?? 0;
  }

  private calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }
}
