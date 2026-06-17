import { fireEvent, render, screen } from '@testing-library/react';

import { Card } from '../Card';

describe('Card', () => {
  it('renders linked titles, description, excerpt, and tags', () => {
    render(
      <Card
        title="Proyecto Solar"
        href="/projects/solar"
        description="Monitoreo distribuido"
        excerpt="Convocatoria 2026"
        tags={['Energia', 'IoT']}
      />,
    );

    expect(screen.getByRole('link', { name: 'Proyecto Solar' })).toHaveAttribute(
      'href',
      '/projects/solar',
    );
    expect(screen.getByText('Monitoreo distribuido')).toBeInTheDocument();
    expect(screen.getByText('Convocatoria 2026')).toBeInTheDocument();
    expect(screen.getByLabelText('Tags')).toBeInTheDocument();
    expect(screen.getByText('Energia')).toBeInTheDocument();
    expect(screen.getByText('IoT')).toBeInTheDocument();
  });

  it('supports keyboard activation for interactive cards', () => {
    const onClick = jest.fn();

    render(<Card title="Interactiva" onClick={onClick} hideImage />);

    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
