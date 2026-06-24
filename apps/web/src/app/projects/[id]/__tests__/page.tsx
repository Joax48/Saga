import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ProjectsDetailPage from '../page';
import { getProjectById } from '@/services/projects';

jest.mock('@/services/projects', () => ({
  getProjectById: jest.fn(),
}));

jest.mock('@/components/DetailNavbar', () => {
  return function MockDetailNavbar({
    categories,
    defaultActive,
    onCategoryChange,
  }: {
    categories: Array<{ id: string; name: string }>;
    defaultActive?: string;
    onCategoryChange: (categoryId: string) => void;
  }) {
    return (
      <div>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onCategoryChange(category.id)}
          >
            {category.name}
          </button>
        ))}
        <div>Tab inicial: {defaultActive}</div>
      </div>
    );
  };
});

jest.mock('../../../researchers/components/ResearchersCardsGrid', () => {
  return function MockResearchersCardsGrid({
    researchers,
    currentPage,
    totalPages,
  }: {
    researchers: Array<{
      id: string;
      name: string;
      workUnits: Array<{ id: string; name: string }>;
      participationStartDate?: string;
      participationEndDate?: string;
    }>;
    currentPage: number;
    totalPages: number;
  }) {
    return (
      <div data-testid="researchers-cards-grid">
        <div>
          Page {currentPage} of {totalPages}
        </div>
        {researchers.map((researcher) => (
          <div key={researcher.id}>
            <span>{researcher.name}</span>
            <span>{researcher.workUnits.map((unit) => unit.name).join(', ')}</span>
            <span>{researcher.participationStartDate ?? 'sin inicio'}</span>
            <span>{researcher.participationEndDate ?? 'sin fin'}</span>
          </div>
        ))}
      </div>
    );
  };
});

const getProjectByIdMock = getProjectById as jest.MockedFunction<typeof getProjectById>;

describe('projects/[id]/page', () => {
  beforeEach(() => {
    getProjectByIdMock.mockReset();
  });

  it('renders project detail data and switches between tabs', async () => {
    const user = userEvent.setup();

    getProjectByIdMock.mockResolvedValue({
      id: 'p-1',
      code: 'PI-2026-01',
      title: 'Campus Inteligente',
      description: 'Proyecto para monitoreo ambiental.',
      manager: 'Ana Perez',
      managerId: '42',
      managerParticipationStartDate: '2026-01-15',
      managerParticipationEndDate: '2026-12-15',
      institute: 'CIMAR',
      disciplines: ['Ingenieria', 'Ambiente'],
      researchType: 'Aplicada',
      projectType: 'Investigacion',
      fundingType: 'Interno',
      status: 'Activo',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      keywords: ['IoT', 'Sensores'],
      associatedProfiles: [
        {
          id: '77',
          name: 'Luis Mora',
          workUnits: [{ id: '8', name: 'Escuela de Computación' }],
          role: 'Colaborador',
          participationStartDate: '2026-02-01',
        },
      ],
    });

    render(<ProjectsDetailPage params={{ id: 'p-1' }} />);

    await waitFor(() => {
      expect(screen.getByText('PI-2026-01 | Campus Inteligente')).toBeInTheDocument();
    });

    expect(getProjectByIdMock).toHaveBeenCalledWith('p-1');
    expect(screen.getByRole('link', { name: 'Ana Perez' })).toHaveAttribute(
      'href',
      '/researchers/42',
    );
    expect(screen.getByText(/CIMAR/)).toBeInTheDocument();
    expect(screen.getByText(/Proyecto para monitoreo ambiental/)).toBeInTheDocument();
    expect(screen.getByText(/15\/01\/2026 - 15\/12\/2026/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Perfiles asociados' }));
    expect(screen.getByTestId('researchers-cards-grid')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
    expect(screen.getByText('Luis Mora')).toBeInTheDocument();
    expect(screen.getByText('Escuela de Computación')).toBeInTheDocument();
    expect(screen.getByText('2026-02-01')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Palabras claves' }));
    expect(screen.getByText('IoT')).toBeInTheDocument();
    expect(screen.getByText('Sensores')).toBeInTheDocument();
  });

  it('formats a participation period with only the start date', async () => {
    const user = userEvent.setup();

    getProjectByIdMock.mockResolvedValue({
      id: 'p-1',
      code: 'PI-2026-03',
      title: 'Proyecto con fecha parcial',
      description: 'Proyecto con solo fecha de inicio del responsable.',
      manager: 'Ana Perez',
      managerId: '42',
      managerParticipationStartDate: '2026-02-01',
      managerParticipationEndDate: undefined,
      institute: 'CIGEFI',
      disciplines: ['Ambiente'],
      researchType: 'Aplicada',
      projectType: 'Investigacion',
      fundingType: 'Interno',
      status: 'Activo',
      startDate: '2026-02-01',
      endDate: '2026-12-31',
      keywords: [],
      associatedProfiles: [],
    });

    render(<ProjectsDetailPage params={{ id: 'p-1' }} />);

    await waitFor(() => {
      expect(
        screen.getByText('PI-2026-03 | Proyecto con fecha parcial'),
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/Desde 01\/02\/2026/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Palabras claves' }));
    expect(screen.getByText(/No hay palabras clave asociadas/)).toBeInTheDocument();
  });

  it('renders the error state when the project request fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    getProjectByIdMock.mockRejectedValue(new Error('Not found'));

    render(<ProjectsDetailPage params={{ id: 'missing' }} />);

    await waitFor(() => {
      expect(
        screen.getByText('No se pudo cargar el proyecto. Intenta nuevamente más tarde.'),
      ).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it('renders fallback detail content when manager id and collaborators are missing', async () => {
    const user = userEvent.setup();

    getProjectByIdMock.mockResolvedValue({
      id: 'p-2',
      code: 'PI-2026-02',
      title: 'Proyecto sin equipo',
      description: 'Sin personas asociadas.',
      manager: 'Sin responsable',
      managerParticipationStartDate: undefined,
      managerParticipationEndDate: undefined,
      institute: 'Sin unidad asociada',
      disciplines: [],
      researchType: 'Extension',
      projectType: 'Accion social',
      fundingType: 'Interno',
      status: 'Planeado',
      startDate: '2026-03-01',
      endDate: '2026-09-01',
      keywords: [],
      associatedProfiles: [],
    });

    render(<ProjectsDetailPage params={{ id: 'p-2' }} />);

    await waitFor(() => {
      expect(screen.getByText('PI-2026-02 | Proyecto sin equipo')).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: 'Sin responsable' })).toHaveAttribute(
      'href',
      '/researchers?q=Sin%20responsable',
    );
    expect(screen.getByText(/Sin unidad asociada/)).toBeInTheDocument();
    expect(screen.getByText(/Sin disciplinas registradas/)).toBeInTheDocument();
    expect(screen.queryByText(/Colaboraci/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Perfiles asociados' }));
    expect(screen.getByText('No hay perfiles asociados.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Palabras claves' }));
    expect(screen.queryByText('IoT')).not.toBeInTheDocument();
  });
});
