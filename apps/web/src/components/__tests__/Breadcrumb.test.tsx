import { render, screen } from '@testing-library/react';

import Breadcrumb from '../Breadcrumb';

describe('Breadcrumb', () => {
  it('renders the home link plus linked and current items', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Proyectos', href: '/projects' },
          { label: 'Detalle' },
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Proyectos' })).toHaveAttribute(
      'href',
      '/projects',
    );
    expect(screen.getByText('Detalle')).toBeInTheDocument();
  });
});
