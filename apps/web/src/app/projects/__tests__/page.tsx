import { render, screen } from '@testing-library/react';

import ProjectsPage from '../page';
import ProjectsViewClient from '../components/ProjectsViewClient';

jest.mock('../components/ProjectsViewClient', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="projects-view-client" />),
}));

const ProjectsViewClientMock = ProjectsViewClient as jest.MockedFunction<
  typeof ProjectsViewClient
>;

describe('projects/page', () => {
  beforeEach(() => {
    ProjectsViewClientMock.mockClear();
  });

  it('passes parsed search params to the projects view client', async () => {
    const element = await ProjectsPage({
      searchParams: {
        page: '3',
        q: 'energia solar',
        researchType: 'Aplicada, Basica ,',
        projectType: 'Investigacion',
        startYear: '2024, 2025',
        status: 'Activo',
        participants: 'Ana Perez, Luis Mora',
        keywords: 'IoT,  Sensores',
      },
    });

    render(element);

    expect(screen.getByTestId('projects-view-client')).toBeInTheDocument();
    expect(ProjectsViewClientMock).toHaveBeenCalledWith(
      expect.objectContaining({
        initialProjects: [],
        initialTotal: 0,
        initialFilterOptions: null,
        initialSearchQuery: 'energia solar',
        initialPage: 3,
        initialFilters: {
          researchType: ['Aplicada', 'Basica'],
          projectType: ['Investigacion'],
          startYear: ['2024', '2025'],
          status: ['Activo'],
          participants: ['Ana Perez', 'Luis Mora'],
          keywords: ['IoT', 'Sensores'],
        },
      }),
      {},
    );
  });

  it('falls back to the default first page and empty filters when query params are missing', async () => {
    const element = await ProjectsPage({ searchParams: {} });

    render(element);

    expect(ProjectsViewClientMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        initialSearchQuery: '',
        initialPage: 1,
        initialFilters: {
          researchType: [],
          projectType: [],
          startYear: [],
          status: [],
          participants: [],
          keywords: [],
        },
      }),
      {},
    );
  });
});
