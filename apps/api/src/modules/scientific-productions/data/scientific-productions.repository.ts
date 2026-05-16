import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CLIENT } from '../../../common/database/database-client.contract';
import type { DatabaseClient } from '../../../common/database/database-client.contract';

import {
  ScientificProductionsFiltersResponseDto,
  ScientificProductionsFiltersRequestDto,
} from '../scientific-productions.reader.contract';
import type {
  ScientificProductionSummary,
  ScientificProductionDetail,
} from '../scientific-production.entity';

import {
  SUMMARY_SELECT,
  DETAIL_SELECT,
  BASE_FROM,
  AUTHORS_ALL_SUBQUERY,
  UCR_AUTHORS_SUBQUERY,
  EXTERNAL_AUTHORS_SUBQUERY,
  UNITS_SUBQUERY,
  AFFILIATIONS_SUBQUERY,
  KEYWORDS_SUBQUERY,
} from './scientific-productions.queries';

type PaginatedResult<T> = {
  items: T[];
  total: number;
};

// type ScientificProductionCountRow = {
//   totalCount: number;
// };

// types en el repositorio
type FilterField = 'type' | 'openAccess' | 'year' | 'keywords' | 'q';

type FacetRow = {
  LABEL: string;
  OPTIONVALUE: string;
  OPTIONCOUNT: number;
};

type BuiltWhereClause = {
  clause: string;
  params: Record<string, unknown>;
};

@Injectable()
export class ScientificProductionRepository {
  constructor(
    @Inject(DATABASE_CLIENT)
    private readonly databaseClient: DatabaseClient,
  ) {}

  async findPaginated(
    page: number,
    limit: number,
    filters?: ScientificProductionsFiltersRequestDto,
  ): Promise<PaginatedResult<ScientificProductionSummary>> {
    const offset = this.calculateOffset(page, limit);
    const { clause, params } = this.buildFilterWhereClause(filters);

    const [items, total] = await Promise.all([
      this.findItemsPage(limit, offset, clause, params),
      this.countScientificProductions(clause, params),
    ]);

    return { items, total };
  }

  async findById(id: string): Promise<ScientificProductionDetail | null> {
    const rows = await this.databaseClient.query<ScientificProductionDetail>(
      `
      ${DETAIL_SELECT}
      ${BASE_FROM}
      ${UCR_AUTHORS_SUBQUERY}
      ${EXTERNAL_AUTHORS_SUBQUERY}
      ${UNITS_SUBQUERY}
      ${AFFILIATIONS_SUBQUERY}
      ${KEYWORDS_SUBQUERY}
      WHERE so.SCIENTIFIC_OUTPUT_ID = :id
      `,
      { id: id },
    );
    return rows[0] ?? null;
  }

  async findFilters(
    filters?: ScientificProductionsFiltersRequestDto,
  ): Promise<ScientificProductionsFiltersResponseDto> {
    const [types, years, keywords, openAccessCount] = await Promise.all([
      this.findTypeFilters(filters),
      this.findYearFilters(filters),
      this.findKeywordFilters(filters),
      this.findOpenAccessCount(filters),
    ]);
    return { types, years, keywords, openAccessCount };
  }

  // ── Private query methods ─────────────────────────────────────────

  private async findItemsPage(
    limit: number,
    offset: number,
    clause: string,
    params: Record<string, unknown>,
  ): Promise<ScientificProductionSummary[]> {
    return this.databaseClient.query<ScientificProductionSummary>(
      `
      ${SUMMARY_SELECT}
      ${BASE_FROM}
      ${AUTHORS_ALL_SUBQUERY}
      ${KEYWORDS_SUBQUERY}
      ${clause}
      ORDER BY so.PUBLICATION_YEAR DESC, so.SCIENTIFIC_OUTPUT_ID
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
      `,
      {
        ...params,
        offset: offset,
        limit: limit,
      },
    );
  }

  private async countScientificProductions(
    clause: string,
    params: Record<string, unknown>,
  ): Promise<number> {
    const rows = await this.databaseClient.query<{ TOTALCOUNT: number }>(
      `
      SELECT COUNT(*) AS TOTALCOUNT
      FROM (
        SELECT DISTINCT so.SCIENTIFIC_OUTPUT_ID
        ${BASE_FROM}
        ${clause}
      )
      `,
      { ...params },
    );
    return rows[0]?.TOTALCOUNT ?? 0;
  }

  private async findTypeFilters(filters?: ScientificProductionsFiltersRequestDto) {
    const { clause, params } = this.buildFacetWhereClause(filters, ['type']);
    const rows = await this.databaseClient.query<FacetRow>(
      `
      SELECT
        sot.SCIENTIFIC_OUTPUT_TYPE_NAME AS LABEL,
        sot.SCIENTIFIC_OUTPUT_TYPE_NAME AS OPTIONVALUE,
        COUNT(DISTINCT so.SCIENTIFIC_OUTPUT_ID) AS OPTIONCOUNT
      ${BASE_FROM}
      ${clause}
      GROUP BY sot.SCIENTIFIC_OUTPUT_TYPE_NAME
      ORDER BY OPTIONCOUNT DESC
      `,
      { ...params },
    );
    return rows.map((row) => ({
      label: row.LABEL,
      value: row.OPTIONVALUE,
      count: row.OPTIONCOUNT,
    }));
  }

  private async findYearFilters(filters?: ScientificProductionsFiltersRequestDto) {
    const { clause, params } = this.buildFacetWhereClause(filters, ['year']);
    const rows = await this.databaseClient.query<FacetRow>(
      `
      SELECT
        TO_CHAR(so.PUBLICATION_YEAR) AS LABEL,
        TO_CHAR(so.PUBLICATION_YEAR) AS OPTIONVALUE,
        COUNT(DISTINCT so.SCIENTIFIC_OUTPUT_ID) AS OPTIONCOUNT
      ${BASE_FROM}
      ${clause}
      GROUP BY so.PUBLICATION_YEAR
      ORDER BY so.PUBLICATION_YEAR DESC
      `,
      { ...params },
    );
    return rows.map((row) => ({
      label: row.LABEL,
      value: row.OPTIONVALUE,
      count: row.OPTIONCOUNT,
    }));
  }

  private async findKeywordFilters(filters?: ScientificProductionsFiltersRequestDto) {
    const { clause, params } = this.buildFacetWhereClause(filters, ['keywords']);
    const rows = await this.databaseClient.query<FacetRow>(
      `
      SELECT
        k.KEYWORD AS LABEL,
        LOWER(k.KEYWORD) AS OPTIONVALUE,
        COUNT(DISTINCT so.SCIENTIFIC_OUTPUT_ID) AS OPTIONCOUNT
      ${BASE_FROM}
      JOIN PRODUCCION_CIENTIFICA.SCIENTIFIC_OUTPUT_KEYWORD sok
        ON sok.SCIENTIFIC_OUTPUT_ID = so.SCIENTIFIC_OUTPUT_ID
      JOIN PRODUCCION_CIENTIFICA.KEYWORD k
        ON k.KEYWORD_ID = sok.KEYWORD_ID
      ${clause}
      GROUP BY k.KEYWORD
      ORDER BY OPTIONCOUNT DESC
      FETCH FIRST 50 ROWS ONLY
      `,
      { ...params },
    );
    return rows.map((row) => ({
      label: row.LABEL,
      value: row.OPTIONVALUE,
      count: row.OPTIONCOUNT,
    }));
  }

  private async findOpenAccessCount(
    filters?: ScientificProductionsFiltersRequestDto,
  ): Promise<number> {
    const { clause, params } = this.buildFacetWhereClause(filters, ['openAccess']);
    const openAccessClause = clause
      ? `${clause} AND sc.OPEN_ACCESS = 1`
      : 'WHERE sc.OPEN_ACCESS = 1';

    const rows = await this.databaseClient.query<{ TOTALCOUNT: number }>(
      `
      SELECT COUNT(DISTINCT so.SCIENTIFIC_OUTPUT_ID) AS TOTALCOUNT
      ${BASE_FROM}
      ${openAccessClause}
      `,
      { ...params },
    );
    return rows[0]?.TOTALCOUNT ?? 0;
  }

  // ── WHERE clause builders ─────────────────────────────────────────
  // Two separate builders — one for results, one for facets
  // The facets builder accepts excludedFilters

  private buildFilterWhereClause(
    filters?: ScientificProductionsFiltersRequestDto,
  ): BuiltWhereClause {
    return this.buildFacetWhereClause(filters, []);
  }

  private buildFacetWhereClause(
    filters?: ScientificProductionsFiltersRequestDto,
    excludedFilters: FilterField[] = [],
  ): BuiltWhereClause {
    if (!filters) return { clause: '', params: {} };

    const clauses: string[] = [];
    const params: Record<string, unknown> = {};

    if (filters.q && !excludedFilters.includes('q')) {
      const query = filters.q.trim();
      if (query.length > 0) {
        clauses.push(`LOWER(so.TITLE) LIKE LOWER(:q)`);
        params['q'] = `%${query}%`;
      }
    }

    if (filters.type?.length && !excludedFilters.includes('type')) {
      const placeholders = filters.type.map((_, i) => `:type${i}`).join(', ');
      clauses.push(`sot.SCIENTIFIC_OUTPUT_TYPE_NAME IN (${placeholders})`);
      filters.type.forEach((t, i) => {
        params[`type${i}`] = t;
      });
    }

    if (filters.openAccess !== undefined && !excludedFilters.includes('openAccess')) {
      clauses.push(`sc.OPEN_ACCESS = :openAccess`);
      params['openAccess'] = filters.openAccess ? 1 : 0;
    }

    if (filters.year?.length && !excludedFilters.includes('year')) {
      const placeholders = filters.year.map((_, i) => `:year${i}`).join(', ');
      clauses.push(`TO_CHAR(so.PUBLICATION_YEAR) IN (${placeholders})`);
      filters.year.forEach((y, i) => {
        params[`year${i}`] = y;
      });
    }

    if (filters.keywords?.length && !excludedFilters.includes('keywords')) {
      filters.keywords.forEach((keyword, i) => {
        clauses.push(`
          EXISTS (
            SELECT 1
            FROM PRODUCCION_CIENTIFICA.SCIENTIFIC_OUTPUT_KEYWORD sok
            JOIN PRODUCCION_CIENTIFICA.KEYWORD k
              ON k.KEYWORD_ID = sok.KEYWORD_ID
            WHERE sok.SCIENTIFIC_OUTPUT_ID = so.SCIENTIFIC_OUTPUT_ID
            AND LOWER(k.KEYWORD) LIKE LOWER(:kw${i})
          )
        `);
        params[`kw${i}`] = `%${keyword}%`;
      });
    }

    const clause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    return { clause, params };
  }

  private calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }
}
