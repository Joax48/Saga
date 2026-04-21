import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../common/database/database.service';
import type { Unit } from '../unit.entity';

type PaginatedResult<T> = {
  items: T[];
  total: number;
};

type UnitCountRow = {
  totalCount: number;
};

const BASE_UNITS_SELECT = `
  SELECT
    Unit.id  AS id,
    Unit.name     AS name,
    Unit.image_url AS imageUrl
  FROM Unit
`;

const UNIT_DETAIL_SELECT = `
  SELECT
    Unit.id      AS id,
    Unit.name         AS name,
    Unit.description  AS description,
    Unit.email        AS email,
    Unit.page_url     AS pageUrl,
    Unit.phone_number AS phoneNumber
  FROM Unit
`;

const COUNT_UNITS_QUERY = `
  SELECT COUNT(*) AS totalCount
  FROM Unit
`;

@Injectable()
export class UnitsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<PaginatedResult<Unit>> {
    const offset = this.calculateOffset(page, limit);

    const [items, total] = await Promise.all([
      this.findItemsPage(limit, offset, search),
      this.countUnits(search),
    ]);

    return {
      items,
      total,
    };
  }

  private async findItemsPage(
    limit: number,
    offset: number,
    search?: string,
  ): Promise<Unit[]> {
    const whereClause = search ? `WHERE Unit.name LIKE ?` : '';
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
    }

    return this.databaseService.query<Unit>(
      `
        ${BASE_UNITS_SELECT}
        ${whereClause}
        ORDER BY Unit.name ASC
        LIMIT ${limit} OFFSET ${offset}
      `,
      params,
    );
  }

  private async countUnits(search?: string): Promise<number> {
    const whereClause = search ? `WHERE Unit.name LIKE ?` : '';
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
    }

    const totalRows = await this.databaseService.query<UnitCountRow>(
      `${COUNT_UNITS_QUERY} ${whereClause}`,
      params,
    );

    return totalRows[0]?.totalCount ?? 0;
  }

  async findById(id: number): Promise<Unit | null> {
    const rows = await this.databaseService.query<Unit>(
      `${UNIT_DETAIL_SELECT} WHERE Unit.id = ${id} LIMIT 1`,
    );
    return rows[0] ?? null;
  }

  private calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }
}