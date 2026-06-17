import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ProjectsViewClient from '../ProjectsViewClient';
import { getProjectFilters, getProjects } from '@/services/projects';
import type { ProjectQueryFilters } from '@/services/projects';

jest.mock('@/services/projects', () => ({
  getProjectFilters: jest.fn(),
  getProjects: jest.fn(),
}));

jest.mock('@/components/PageHeroSearch', () => {
  return function MockPageHeroSearch({
    onSearch,
    searchPlaceholder,
  }: {
    onSearch: (query: string) => void;
    searchPlaceholder: string;
  }) {
    return (
      <div>
        <button type="button" onClick={() => onSearch('PI-2026-01')}>
          Buscar por codigo
        </button>
        <button type="button" onClick={() => onSearch('Campus Inteligente')}>
          Buscar por nombre
        </button>
        <button type="button" onClick={() => onSearch('Ana Perez')}>
          Buscar por participante
        </button>
        <span>{searchPlaceholder}</span>
      </div>
    );
  };
});

jest.mock('@/components/FilterSidebar', () => ({
  FilterSidebar: ({
    groups,
    hasActiveFilters,
    onClearAll,
  }: {
    groups: Array<{
      title: string;
      selectedValues?: string[];
      onToggle?: (value: string) => void;
    }>;
    hasActiveFilters?: boolean;
    onClearAll?: () => void;
  }) => (
    <div>
      {groups.map((group) => (
        <button
          key={group.title}
          type="button"
          onClick={() => group.onToggle?.(`${group.title}-valor`)}
        >
          Toggle {group.title}
        </button>
      ))}
      {hasActiveFilters ? (
        <button type="button" onClick={onClearAll}>
          Limpiar filtros
        </button>
      ) : null}
    </div>
  ),
}));

jest.mock('@/components/Pagination', () => {
  return function MockPagination({
    onPageChange,
  }: {
    onPageChange: (page: number) => void;
  }) {
    return (
      <button type="button" onClick={() => onPageChange(2)}>
        Ir a pagina 2
      </button>
    );
  };
});

jest.mock('@/components/SortControls', () => ({
  SortControls: ({
    onSortByChange,
    onSortOrderChange,
  }: {
    onSortByChange: (value: 'title' | 'year' | 'code') => void;
    onSortOrderChange: (value: 'asc' | 'desc') => void;
  }) => (
    <div>
      <button type="button" onClick={() => onSortByChange('year')}>
        Ordenar por anio
      </button>
      <button type="button" onClick={() => onSortOrderChange('desc')}>
        Orden descendente
      </button>
    </div>
  ),
}));

jest.mock('../ProjectListItem', () => {
  return function MockProjectListItem({
    title,
    manager,
    managerHref,
  }: {
    title: string;
    manager: string;
    managerHref?: string;
  }) {
    return (
      <div>
        <span>{title}</span>
        <span>{manager}</span>
        <span>{managerHref}</span>
      </div>
    );
  };
});

const getProjectsMock = getProjects as jest.MockedFunction<typeof getProjects>;
const getProjectFiltersMock = getProjectFilters as jest.MockedFunction<
  typeof getProjectFilters
>;

const filterOptions = {
  researchType: [{ value: 'Aplicada', label: 'Aplicada', count: 2 }],
  projectType: [{ value: 'Investigacion', label: 'Investigacion', count: 2 }],
  startYear: [{ value: '2026', label: '2026', count: 2 }],
  status: [{ value: 'Activo', label: 'Activo', count: 1 }],
  participants: [{ value: 'Ana Perez', label: 'Ana Perez', count: 1 }],
  keywords: [{ value: 'IoT', label: 'IoT', count: 1 }],
};

const emptyFilters: ProjectQueryFilters = {
  researchType: [],
  projectType: [],
  startYear: [],
  status: [],
  participants: [],
  keywords: [],
};

const initialProject = {
  id: '1',
  code: 'PI-2026-01',
  title: 'Campus Inteligente',
  manager: 'Ana Perez',
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  researchType: 'Aplicada',
  projectType: 'Investigacion',
  keywords: ['IoT'],
  associatedProfiles: [{ id: '77', name: 'Ana Perez', role: 'Responsable' }],
};

async function waitForListEffects() {
  await waitFor(() => {
    expect(getProjectsMock).toHaveBeenCalled();
    expect(getProjectFiltersMock).toHaveBeenCalled();
  });
}

describe('ProjectsViewClient', () => {
  beforeEach(() => {
    getProjectsMock.mockReset();
    getProjectFiltersMock.mockReset();
    getProjectsMock.mockResolvedValue({
      data: [initialProject],
      total: 1,
      page: 1,
      limit: 10,
    });
    getProjectFiltersMock.mockResolvedValue(filterOptions);
  });

  it('renders an empty state when there are no projects', async () => {
    getProjectsMock.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    });

    render(
      <ProjectsViewClient
        initialProjects={[]}
        initialTotal={0}
        initialFilterOptions={filterOptions}
        initialSearchQuery=""
        initialPage={1}
        initialFilters={emptyFilters}
        initialSortBy="title"
        initialSortOrder="asc"
      />,
    );

    await waitForListEffects();

    expect(screen.getByText('0 resultados')).toBeInTheDocument();
    expect(screen.getByText('No se encontraron resultados.')).toBeInTheDocument();
    expect(screen.queryByText('Ir a pagina 2')).not.toBeInTheDocument();
  });

  it('renders project items and prefers the manager profile link when available', async () => {
    render(
      <ProjectsViewClient
        initialProjects={[initialProject]}
        initialTotal={1}
        initialFilterOptions={filterOptions}
        initialSearchQuery=""
        initialPage={1}
        initialFilters={emptyFilters}
        initialSortBy="title"
        initialSortOrder="asc"
      />,
    );

    await waitForListEffects();

    expect(screen.getByText('1 resultado')).toBeInTheDocument();
    expect(screen.getByText('Campus Inteligente')).toBeInTheDocument();
    expect(screen.getByText('/researchers/77')).toBeInTheDocument();
  });

  it('renders the error state when loading projects fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    getProjectsMock.mockRejectedValue(new Error('Network error'));

    render(
      <ProjectsViewClient
        initialProjects={[initialProject]}
        initialTotal={1}
        initialFilterOptions={filterOptions}
        initialSearchQuery=""
        initialPage={1}
        initialFilters={emptyFilters}
        initialSortBy="title"
        initialSortOrder="asc"
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(
        /No se pudieron cargar los proyectos\./,
      );
    });

    expect(screen.queryByText('1 resultado')).not.toBeInTheDocument();
    expect(screen.queryByText('Ir a pagina 2')).not.toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it.each([
    ['Buscar por codigo', 'PI-2026-01'],
    ['Buscar por nombre', 'Campus Inteligente'],
    ['Buscar por participante', 'Ana Perez'],
  ])('refreshes results when users search by %s', async (buttonLabel, query) => {
    const user = userEvent.setup();

    render(
      <ProjectsViewClient
        initialProjects={[initialProject]}
        initialTotal={1}
        initialFilterOptions={filterOptions}
        initialSearchQuery=""
        initialPage={1}
        initialFilters={emptyFilters}
        initialSortBy="title"
        initialSortOrder="asc"
      />,
    );

    await waitForListEffects();

    getProjectsMock.mockClear();
    getProjectFiltersMock.mockClear();

    await user.click(screen.getByRole('button', { name: buttonLabel }));

    await waitFor(() => {
      expect(getProjectsMock).toHaveBeenCalledWith(
        1,
        10,
        query,
        expect.objectContaining({
          researchType: [],
          projectType: [],
          startYear: [],
          status: [],
          participants: [],
          keywords: [],
        }),
      );
    });

    expect(getProjectFiltersMock).toHaveBeenCalledWith(
      expect.objectContaining({
        researchType: [],
        projectType: [],
        startYear: [],
        status: [],
        participants: [],
        keywords: [],
      }),
      query,
    );
  });

  it('updates results when a filter changes and can clear active filters', async () => {
    const user = userEvent.setup();
    getProjectsMock.mockResolvedValue({
      data: [
        {
          ...initialProject,
          associatedProfiles: [],
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
    });

    render(
      <ProjectsViewClient
        initialProjects={[initialProject]}
        initialTotal={1}
        initialFilterOptions={filterOptions}
        initialSearchQuery=""
        initialPage={1}
        initialFilters={emptyFilters}
        initialSortBy="title"
        initialSortOrder="asc"
      />,
    );

    await waitForListEffects();

    getProjectsMock.mockClear();
    getProjectFiltersMock.mockClear();

    await user.click(screen.getByRole('button', { name: 'Toggle Estado' }));

    await waitFor(() => {
      expect(getProjectsMock).toHaveBeenCalledWith(
        1,
        10,
        '',
        expect.objectContaining({
          status: ['Estado-valor'],
        }),
      );
    });

    expect(screen.getByRole('button', { name: 'Limpiar filtros' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

    await waitFor(() => {
      expect(getProjectsMock).toHaveBeenLastCalledWith(
        1,
        10,
        '',
        expect.objectContaining({
          researchType: [],
          projectType: [],
          startYear: [],
          status: [],
          participants: [],
          keywords: [],
        }),
      );
    });
  });

  it('refetches with the selected sort controls', async () => {
    const user = userEvent.setup();

    render(
      <ProjectsViewClient
        initialProjects={[initialProject]}
        initialTotal={1}
        initialFilterOptions={filterOptions}
        initialSearchQuery=""
        initialPage={1}
        initialFilters={emptyFilters}
        initialSortBy="title"
        initialSortOrder="asc"
      />,
    );

    await waitForListEffects();

    getProjectsMock.mockClear();
    getProjectFiltersMock.mockClear();

    await user.click(screen.getByRole('button', { name: 'Ordenar por anio' }));
    await user.click(screen.getByRole('button', { name: 'Orden descendente' }));

    await waitFor(() => {
      expect(getProjectsMock).toHaveBeenLastCalledWith(
        1,
        10,
        '',
        expect.objectContaining({
          researchType: [],
          projectType: [],
          startYear: [],
          status: [],
          participants: [],
          keywords: [],
          sortBy: 'year',
          sortOrder: 'desc',
        }),
      );
    });
  });

  it('requests another page when pagination changes', async () => {
    const user = userEvent.setup();
    getProjectsMock.mockResolvedValue({
      data: Array.from({ length: 10 }, (_, index) => ({
        ...initialProject,
        id: String(index + 1),
        title: `Proyecto ${index + 1}`,
      })),
      total: 20,
      page: 1,
      limit: 10,
    });

    render(
      <ProjectsViewClient
        initialProjects={Array.from({ length: 10 }, (_, index) => ({
          ...initialProject,
          id: String(index + 1),
          title: `Proyecto ${index + 1}`,
        }))}
        initialTotal={20}
        initialFilterOptions={filterOptions}
        initialSearchQuery=""
        initialPage={1}
        initialFilters={emptyFilters}
        initialSortBy="title"
        initialSortOrder="asc"
      />,
    );

    await waitForListEffects();

    getProjectsMock.mockClear();

    await user.click(screen.getByRole('button', { name: 'Ir a pagina 2' }));

    await waitFor(() => {
      expect(getProjectsMock).toHaveBeenCalledWith(
        2,
        10,
        '',
        expect.objectContaining({
          researchType: [],
          projectType: [],
          startYear: [],
          status: [],
          participants: [],
          keywords: [],
        }),
      );
    });
  });
});
