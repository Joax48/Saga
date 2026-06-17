import { render, screen } from '@testing-library/react';

import ProjectsLoading from '../loading';

describe('projects/loading', () => {
  it('renders the projects loading skeleton layout', () => {
    const { container } = render(<ProjectsLoading />);

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(container.querySelectorAll('.skeleton').length).toBeGreaterThan(5);
    expect(container.querySelectorAll('section')).toHaveLength(2);
  });
});
