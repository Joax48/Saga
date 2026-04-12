import { DatabaseService } from '../database.service';
import alasql from 'alasql';

jest.mock('alasql', () => {
  const mock = jest.fn();
  return { __esModule: true, default: mock };
});

jest.mock('../tables', () => ({
  databaseTables: [
    {
      name: 'Project_Type',
      dropSql: 'DROP TABLE IF EXISTS Project_Type',
      createSql: 'CREATE TABLE Project_Type (id INT, description STRING)',
      seedSql: 'INSERT INTO Project_Type VALUES (?, ?)',
      seedRows: [{ params: [1, 'Humanistico'] }, { params: [2, 'Interdisciplinario'] }],
    },
    {
      name: 'Project',
      dropSql: 'DROP TABLE IF EXISTS Project',
      createSql: 'CREATE TABLE Project (id INT, name STRING)',
      seedSql: 'INSERT INTO Project VALUES (?)',
      seedRows: [{ params: [1] }, {}],
    },
  ],
}));

const mockedAlasql = alasql as unknown as jest.Mock;

describe('DatabaseService', () => {
  beforeEach(() => {
    mockedAlasql.mockReset();
  });

  describe('constructor', () => {
    it('should create the database, reset, create, and seed tables on instantiation', () => {
      new DatabaseService();

      const calls = mockedAlasql.mock.calls.map((c) => c[0]);

      expect(calls[0]).toBe('CREATE DATABASE IF NOT EXISTS saga_db_mock');
      expect(calls[1]).toBe('USE saga_db_mock');

      expect(calls).toContain('DROP TABLE IF EXISTS Project');
      expect(calls).toContain('DROP TABLE IF EXISTS Project_Type');

      expect(calls).toContain('CREATE TABLE Project_Type (id INT, description STRING)');
      expect(calls).toContain('CREATE TABLE Project (id INT, name STRING)');

      expect(calls).toContain('INSERT INTO Project_Type VALUES (?, ?)');
      expect(calls).toContain('INSERT INTO Project VALUES (?)');
    });

    it('should drop tables in reverse order before creating them', () => {
      new DatabaseService();

      const calls = mockedAlasql.mock.calls.map((c) => c[0]);
      const dropProject = calls.indexOf('DROP TABLE IF EXISTS Project');
      const dropProjectType = calls.indexOf('DROP TABLE IF EXISTS Project_Type');

      expect(dropProject).toBeLessThan(dropProjectType);
    });

    it('should pass params to seed SQL and default to empty array when params is undefined', () => {
      new DatabaseService();

      const seedCalls = mockedAlasql.mock.calls.filter((c) =>
        (c[0] as string).startsWith('INSERT INTO'),
      );

      expect(seedCalls).toContainEqual([
        'INSERT INTO Project_Type VALUES (?, ?)',
        [1, 'Humanistico'],
      ]);
      expect(seedCalls).toContainEqual([
        'INSERT INTO Project_Type VALUES (?, ?)',
        [2, 'Interdisciplinario'],
      ]);
      expect(seedCalls).toContainEqual(['INSERT INTO Project VALUES (?)', [1]]);
      expect(seedCalls).toContainEqual(['INSERT INTO Project VALUES (?)', []]);
    });
  });

  describe('query', () => {
    it('should execute the SQL text with parameters and return the result', async () => {
      new DatabaseService();
      mockedAlasql.mockReset();

      const service = Object.create(DatabaseService.prototype);
      const mockRows = [{ id: 1, name: 'El costo de una vida digna en Costa Rica' }];
      mockedAlasql.mockReturnValue(mockRows);

      const result = await service.query('SELECT * FROM Project WHERE id = ?', [1]);

      expect(mockedAlasql).toHaveBeenCalledWith(
        'SELECT * FROM Project WHERE id = ?',
        [1],
      );
      expect(result).toEqual(mockRows);
    });

    it('should default params to an empty array when not provided', async () => {
      new DatabaseService();
      mockedAlasql.mockReset();

      const service = Object.create(DatabaseService.prototype);
      mockedAlasql.mockReturnValue([]);

      await service.query('SELECT * FROM Project');

      expect(mockedAlasql).toHaveBeenCalledWith('SELECT * FROM Project', []);
    });
  });
});
