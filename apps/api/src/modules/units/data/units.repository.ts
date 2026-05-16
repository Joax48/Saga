import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CLIENT } from '../../../common/database/database-client.contract';
import type { DatabaseClient } from '../../../common/database/database-client.contract';
import type { Unit } from '../unit.entity';
import { UnitSearchDTO } from '../../../bff/public/units/dtos/unit-search-dto';

type PaginatedResult<T> = {
  items: T[];
  total: number;
};

type UnitCountRow = {
  totalCount: number;
};

const BASE_UNITS_SELECT = `
  SELECT
    u.unit_id AS "id",
    u.unit_name AS "name",
    u.unit_image_url AS "imageUrl"
  FROM unit u
`;

const UNIT_DETAIL_SELECT = `
  SELECT
    u.unit_id AS "id",
    u.unit_name AS "name",
    u.unit_description AS "description",
    u.unit_email AS "email",
    u.unit_page_url AS "pageUrl",
    LISTAGG(up.phone_number, ', ') WITHIN GROUP (ORDER BY up.phone_number) AS "phoneNumber"
  FROM unit u
  LEFT JOIN unit_phone up ON up.unit_id = u.unit_id
`;

const COUNT_UNITS_QUERY = `
  SELECT COUNT(DISTINCT u.unit_id) AS "totalCount"
  FROM unit u
`;

@Injectable()
export class UnitsRepository {
  constructor(@Inject(DATABASE_CLIENT) private readonly databaseClient: DatabaseClient) {}

  async findPaginated(searchDTO: UnitSearchDTO): Promise<PaginatedResult<Unit>> {
    const [items, total] = await Promise.all([
      this.findItemsPage(searchDTO),
      this.countUnits(searchDTO),
    ]);
    return { items, total };
  }

  private buildWhere(searchDTO: UnitSearchDTO): {
    clause: string;
    params: Record<string, string | number | number[] | undefined>;
  } {
    const conditions: string[] = [];
    const params: Record<string, string | number | number[] | undefined> = {};

    if (searchDTO.researcherIds?.length) {
      const ids = searchDTO.researcherIds.map((_, i) => `:rid${i}`).join(', ');

      searchDTO.researcherIds.forEach((id, i) => {
        params[`rid${i}`] = id;
      });

      conditions.push(`
        EXISTS (
          SELECT 1
          FROM ucr_profile_project_unit ppu
          WHERE ppu.unit_id = u.unit_id
            AND ppu.profile_id IN (${ids})
        )
      `);
    }

    if (searchDTO.q) {
      params.q = `%${searchDTO.q}%`;
      conditions.push(`u.unit_name LIKE :q`);
    }

    const clause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    return { clause, params };
  }

  private buildOrderClause(unitSearchDTO: UnitSearchDTO): string {
    const direction = unitSearchDTO.sortOrder === 'desc' ? 'DESC' : 'ASC';
    return `ORDER BY u.unit_name ${direction}`;
  }

  private async findItemsPage(unitSearchDTO: UnitSearchDTO): Promise<Unit[]> {
    const { clause, params } = this.buildWhere(unitSearchDTO);
    const orderClause = this.buildOrderClause(unitSearchDTO);

    const offset = this.calculateOffset(unitSearchDTO.page, unitSearchDTO.limit);

    return this.databaseClient.query<Unit>(
      `
      ${BASE_UNITS_SELECT}
      ${clause}
      ${orderClause}
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
      `,
      {
        ...params,
        offset,
        limit: unitSearchDTO.limit,
      },
    );
  }

  private async countUnits(searchDTO: UnitSearchDTO): Promise<number> {
    const { clause, params } = this.buildWhere(searchDTO);

    const totalRows = await this.databaseClient.query<UnitCountRow>(
      `${COUNT_UNITS_QUERY} ${clause}`,
      params,
    );

    return totalRows[0]?.totalCount ?? 0;
  }

  async findById(id: number): Promise<Unit | null> {
    const rows = await this.databaseClient.query<Unit>(
      `
      ${UNIT_DETAIL_SELECT}
      WHERE u.unit_id = :id
      GROUP BY
        u.unit_id,
        u.unit_name,
        u.unit_description,
        u.unit_email,
        u.unit_page_url
      `,
      { id },
    );

    return rows[0] ?? null;
  }

  private calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }
}
