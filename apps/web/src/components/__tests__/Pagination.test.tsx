import { fireEvent, render, screen } from '@testing-library/react';

import Pagination from '../Pagination';

describe('Pagination', () => {
  it('disables first/previous buttons on the first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={jest.fn()} />);

    expect(screen.getByRole('button', { name: /Primero/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Anterior/i })).toBeDisabled();
  });

  it('calls onPageChange for numbered and next navigation', () => {
    const onPageChange = jest.fn();

    render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByRole('button', { name: '3' }));
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    expect(onPageChange).toHaveBeenNthCalledWith(1, 3);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3);
  });
});
