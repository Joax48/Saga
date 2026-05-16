import type { DatabaseTableDefinition } from './database-table';

const insertProfileAssociatedWithUnitSql = `
  INSERT INTO Profile_Associated_With_Unit (
    profile_id,
    unit_id
  ) VALUES (?, ?)
`;

type ProfileAssociatedWithUnitSeedRow = {
  profileId: number;
  unitId: number;
};

const profileAssociatedWithUnitRows: ProfileAssociatedWithUnitSeedRow[] = [
  { profileId: 1, unitId: 1 },
  { profileId: 1, unitId: 2 },
  { profileId: 2, unitId: 2 },
  { profileId: 1, unitId: 3 },
  { profileId: 2, unitId: 3 },
  { profileId: 3, unitId: 3 },
  { profileId: 1, unitId: 4 },
  { profileId: 2, unitId: 4 },
  { profileId: 3, unitId: 4 },
  { profileId: 4, unitId: 4 },
];

export const profileAssociatedWithUnitTable: DatabaseTableDefinition = {
  name: 'Profile_Associated_With_Unit',
  dropSql: 'DROP TABLE IF EXISTS Profile_Associated_With_Unit',
  createSql: `
    CREATE TABLE Profile_Associated_With_Unit (
      profile_id INT,
      unit_id INT
    )
  `,
  seedSql: insertProfileAssociatedWithUnitSql,
  seedRows: profileAssociatedWithUnitRows.map((row) => ({
    params: [row.profileId, row.unitId],
  })),
};
