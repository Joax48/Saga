import { render, screen } from '@testing-library/react';

import ProjectListItem from '../ProjectListItem';

describe('ProjectListItem', () => {
  it('renders project metadata and falls back to researcher search link', () => {
    render(
      <ProjectListItem
        code="PI-2026-01"
        title="Campus Inteligente"
        manager="Jane Doe"
        startDate="2026-01-15"
        endDate="2026-12-15"
        researchType="Aplicada"
        actionType="Desarrollo"
        keywords={['IoT', 'Energia']}
      />,
    );

    expect(
      screen.getByRole('link', { name: 'PI-2026-01 | Campus Inteligente' }),
    ).toHaveAttribute('href', '#');
    expect(screen.getByRole('link', { name: 'Jane Doe' })).toHaveAttribute(
      'href',
      '/researchers?q=Jane%20Doe',
    );
    expect(screen.getByText('IoT')).toBeInTheDocument();
    expect(screen.getByText(/Aplicada/)).toBeInTheDocument();
    expect(screen.getByText(/Desarrollo/)).toBeInTheDocument();
  });

  it('uses the provided project and manager links when available', () => {
    render(
      <ProjectListItem
        code="PI-2026-02"
        title="Movilidad Sostenible"
        href="/projects/p-2"
        manager="Ana Perez"
        managerHref="/researchers/42"
        startDate="2026-03-01"
        endDate="2026-09-01"
        researchType="Extension"
        actionType="Accion social"
        keywords={['Transporte']}
      />,
    );

    expect(
      screen.getByRole('link', { name: 'PI-2026-02 | Movilidad Sostenible' }),
    ).toHaveAttribute('href', '/projects/p-2');
    expect(screen.getByRole('link', { name: 'Ana Perez' })).toHaveAttribute(
      'href',
      '/researchers/42',
    );
    expect(screen.getByText('Transporte')).toBeInTheDocument();
    expect(screen.getByText(/Extension/)).toBeInTheDocument();
    expect(screen.getByText(/Accion social/)).toBeInTheDocument();
  });
});
