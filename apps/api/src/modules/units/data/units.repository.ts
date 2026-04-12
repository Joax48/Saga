import { Injectable } from '@nestjs/common';
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
    Unit.imageUrl AS imageUrl
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
    const whereClause = search ? `WHERE Unit.name LIKE '%${search}%'` : '';
    return this.databaseService.query<Unit>(
      `
        ${BASE_UNITS_SELECT}
        ${whereClause}
        ORDER BY Unit.name ASC
        LIMIT ${limit} OFFSET ${offset}
      `,
    );
  }

  private async countUnits(search?: string): Promise<number> {
    const whereClause = search ? `WHERE Unit.name LIKE '%${search}%'` : '';
    const totalRows = await this.databaseService.query<UnitCountRow>(
      `${COUNT_UNITS_QUERY} ${whereClause}`,
    );

    return totalRows[0]?.totalCount ?? 0;
  }

  private calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }
}
