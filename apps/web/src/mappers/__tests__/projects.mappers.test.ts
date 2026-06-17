import {
  mapProjectDetailToProject,
  mapProjectSummaryToProject,
} from '../projects.mappers';

describe('projects.mappers', () => {
  it('maps summary DTOs and falls back when manager is missing', () => {
    expect(
      mapProjectSummaryToProject({
        id: 7,
        code: 'PI-7',
        name: 'Analitica de Datos',
        keywords: ['Datos'],
        projectType: 'Extension',
        researchType: 'Aplicada',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
      }),
    ).toEqual({
      id: '7',
      code: 'PI-7',
      title: 'Analitica de Datos',
      manager: 'Sin responsable',
      projectType: 'Extension',
      researchType: 'Aplicada',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      keywords: ['Datos'],
      associatedProfiles: [],
    });
  });

  it('maps project detail DTOs into the frontend model', () => {
    expect(
      mapProjectDetailToProject({
        id: 'abc',
        code: 'PI-9',
        title: 'Redes Inteligentes',
        description: 'Descripcion',
        manager: {
          id: 3,
          name: '  Ana Perez  ',
          participationStartDate: '2026-01-01',
          participationEndDate: '2026-12-31',
        },
        unit: { id: 1, name: '  CIBCM ' },
        disciplines: [' Biologia ', 'Datos '],
        researchType: 'Basica',
        projectType: 'Investigacion',
        fundingType: 'Interno',
        status: 'Activo',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        keywords: ['Genes'],
        associatedProfiles: [
          {
            id: '4',
            name: 'Luis Mora',
            participationStartDate: '2026-02-01',
          },
        ],
      }),
    ).toEqual({
      id: 'abc',
      code: 'PI-9',
      title: 'Redes Inteligentes',
      description: 'Descripcion',
      manager: 'Ana Perez',
      managerId: '3',
      managerParticipationStartDate: '2026-01-01',
      managerParticipationEndDate: '2026-12-31',
      institute: 'CIBCM',
      disciplines: ['Biologia', 'Datos'],
      researchType: 'Basica',
      projectType: 'Investigacion',
      fundingType: 'Interno',
      status: 'Activo',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      keywords: ['Genes'],
      associatedProfiles: [
        {
          id: '4',
          name: 'Luis Mora',
          participationStartDate: '2026-02-01',
        },
      ],
    });
  });
});
