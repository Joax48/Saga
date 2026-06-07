import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createProjectsTestApp } from '../common/create-projects-test-app';

import { DatabaseClient } from '../../../common/database/database-client.contract';

describe('GET /api/projects/:id', () => {
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

  it('returns project detail', async () => {
    databaseClient.query
      .mockResolvedValueOnce([
        {
          id: 'C3992',
          projectManagerId: 2,
          projectManagerName: 'Koen Voorend',
          code: 'C3992',
          name: 'El costo de una vida digna en Costa Rica',
          description: 'Descripcion del proyecto',
          unitId: 15,
          unitName: 'Instituto de Investigaciones Sociales',
          projectType: 'Proyecto',
          fundingType: 'Financiamiento UCREA',
          researchType: 'Basica',
          status: 'Vencido',
          startDate: '2023-06-01',
          endDate: '2025-12-31',
          principalParticipationStartDate: '2023-06-01',
          principalParticipationEndDate: '2025-12-31',
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 12,
          name: 'Maria Perez',
          role: 'Asociado',
          participationTypeId: 3,
          participationStartDate: '2023-06-01',
          participationEndDate: '',
          participationStartTs: new Date('2023-06-01'),
          participationEndTs: null,
        },
      ])
      .mockResolvedValueOnce([
        { description: 'Ciencias Sociales' },
        { description: 'Estadistica' },
      ])
      .mockResolvedValueOnce([{ description: 'pobreza' }]);

    const response = await request(app.getHttpServer()).get('/api/projects/C3992');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 'C3992',
      code: 'C3992',
      title: 'El costo de una vida digna en Costa Rica',
      description: 'Descripcion del proyecto',
      manager: {
        id: 2,
        name: 'Koen Voorend',
        participationStartDate: '2023-06-01',
        participationEndDate: '2025-12-31',
      },
      unit: { id: 15, name: 'Instituto de Investigaciones Sociales' },
      disciplines: ['Ciencias Sociales', 'Estadistica'],
      researchType: 'Basica',
      projectType: 'Proyecto',
      fundingType: 'Financiamiento UCREA',
      status: 'Vencido',
      startDate: '2023-06-01',
      endDate: '2025-12-31',
      keywords: ['pobreza'],
      associatedProfiles: [
        {
          id: '12',
          name: 'Maria Perez',
          role: 'Asociado',
          participationStartDate: '2023-06-01',
        },
      ],
    });
    expect(databaseClient.query).toHaveBeenCalledTimes(4);
  });

  it('returns 404 when the project does not exist', async () => {
    databaseClient.query.mockResolvedValueOnce([]);

    const response = await request(app.getHttpServer()).get('/api/projects/999');

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      statusCode: 404,
      code: 'NOT_FOUND',
      message: 'Project with id 999 not found',
      path: '/api/projects/999',
    });
    expect(databaseClient.query).toHaveBeenCalledTimes(1);
  });
});
