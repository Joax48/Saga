import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { DatabaseClient } from '../../../common/database/database-client.contract';
import { createProjectsTestApp } from '../common/create-projects-test-app';

describe('GET /api/projects', () => {
  let app: INestApplication;
  let databaseClient: jest.Mocked<DatabaseClient>;

  beforeEach(async () => {
    databaseClient = {
      query: jest.fn(),
    } as jest.Mocked<DatabaseClient>;

    app = await createProjectsTestApp(databaseClient);
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  it('returns a paginated list of projects', async () => {
    const mockProjects = [
      {
        id: 'C2384',
        projectManagerId: 11,
        projectManagerName: 'Koen Voorend',
        code: 'C2384',
        name: 'El costo de una vida digna en Costa Rica',
        unitId: 15,
        unitName: 'Instituto de Investigaciones Sociales',
        projectType: 'Humanistico',
        fundingType: 'Fondos internos',
        researchType: 'Basica',
        status: 'Activo',
        startDate: '2023-06-01',
        endDate: '2025-12-31',
      },
      {
        id: 'C3364',
        projectManagerId: 12,
        projectManagerName: 'Alice Researcher',
        code: 'C3364',
        name: 'Analisis espacio-temporal del impacto de factores climaticos',
        unitId: 8,
        unitName: 'Centro de Investigaciones Geograficas',
        projectType: 'Interdisciplinario',
        fundingType: 'Fondos externos',
        researchType: 'Aplicada',
        status: 'Activo',
        startDate: '2024-01-01',
        endDate: '2026-12-15',
      },
      {
        id: 'C4234',
        projectManagerId: 7,
        projectManagerName: 'Maria Lopez',
        code: 'C4234',
        name: 'Biodiversidad en ecosistemas de altura',
        unitId: 3,
        unitName: 'Escuela de Biologia',
        projectType: 'Proyecto',
        fundingType: 'Financiamiento UCREA',
        researchType: 'Basica',
        status: 'Vencido',
        startDate: '2021-03-01',
        endDate: '2023-02-28',
      },
    ];

    const mockCount = [{ totalCount: 256 }];

    const mockKeywords = [
      { projectId: 'C2384', description: 'economia social' },
      { projectId: 'C2384', description: 'pobreza' },
      { projectId: 'C3364', description: 'clima' },
      { projectId: 'C3364', description: 'impacto ambiental' },
      { projectId: 'C4234', description: 'biodiversidad' },
    ];

    databaseClient.query.mockImplementation((sql: string) => {
      if (sql.includes('SELECT COUNT')) {
        return Promise.resolve(mockCount);
      }

      if (sql.includes('FROM PROJECT_KEYWORD')) {
        return Promise.resolve(mockKeywords);
      }

      return Promise.resolve(mockProjects);
    });

    const response = await request(app.getHttpServer()).get(
      '/api/projects?page=1&limit=3',
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      items: [
        {
          id: 'C2384',
          projectManager: { id: 11, name: 'Koen Voorend' },
          code: 'C2384',
          name: 'El costo de una vida digna en Costa Rica',
          keywords: ['economia social', 'pobreza'],
          projectType: 'Humanistico',
          researchType: 'Basica',
          startDate: '2023-06-01',
          endDate: '2025-12-31',
        },
        {
          id: 'C3364',
          projectManager: { id: 12, name: 'Alice Researcher' },
          code: 'C3364',
          name: 'Analisis espacio-temporal del impacto de factores climaticos',
          keywords: ['clima', 'impacto ambiental'],
          projectType: 'Interdisciplinario',
          researchType: 'Aplicada',
          startDate: '2024-01-01',
          endDate: '2026-12-15',
        },
        {
          id: 'C4234',
          projectManager: { id: 7, name: 'Maria Lopez' },
          code: 'C4234',
          name: 'Biodiversidad en ecosistemas de altura',
          keywords: ['biodiversidad'],
          projectType: 'Proyecto',
          researchType: 'Basica',
          startDate: '2021-03-01',
          endDate: '2023-02-28',
        },
      ],
      page: 1,
      limit: 3,
      total: mockCount[0].totalCount,
    });
  });
});
