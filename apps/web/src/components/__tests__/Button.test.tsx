import { fireEvent, render, screen } from '@testing-library/react';

import Button from '../Button';

describe('Button', () => {
  it('renders a native button and triggers onClick', () => {
    const onClick = jest.fn();

    render(<Button onClick={onClick}>Buscar</Button>);

    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders a link when href is provided', () => {
    render(<Button href="/projects" variant="outline">Proyectos</Button>);

    expect(screen.getByRole('link', { name: 'Proyectos' })).toHaveAttribute(
      'href',
      '/projects',
    );
  });
});
