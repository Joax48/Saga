import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FilterSidebar } from '../FilterSidebar';

describe('FilterSidebar', () => {
  it('shows clear all and toggles inline options', async () => {
    const user = userEvent.setup();
    const onClearAll = jest.fn();
    const onToggle = jest.fn();

    render(
      <FilterSidebar
        groups={[
          {
            kind: 'options',
            title: 'Estado',
            groupKey: 'status',
            options: [
              { value: 'activo', label: 'Activo', count: 3 },
              { value: 'finalizado', label: 'Finalizado', count: 1 },
            ],
            selectedValues: ['activo'],
            onToggle,
          },
        ]}
        hasActiveFilters
        onClearAll={onClearAll}
        resizable={false}
      />,
    );

    expect(screen.getByRole('button', { name: 'Limpiar' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Activo (3)' })).toBeChecked();

    await user.click(screen.getByRole('checkbox', { name: 'Finalizado (1)' }));
    await user.click(screen.getByRole('button', { name: 'Limpiar' }));

    expect(onToggle).toHaveBeenCalledWith('finalizado');
    expect(onClearAll).toHaveBeenCalledTimes(1);
  });

  it('opens the popup for long option lists and clears selected popup items', async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();
    const options = Array.from({ length: 11 }, (_, index) => ({
      value: `item-${index + 1}`,
      label: `Item ${index + 1}`,
      count: index + 1,
    }));

    render(
      <FilterSidebar
        groups={[
          {
            kind: 'options',
            title: 'Participantes',
            groupKey: 'participants',
            options,
            selectedValues: ['item-2', 'item-4'],
            onToggle,
          },
        ]}
        resizable={false}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Ver todos \(11\)/i }));

    expect(screen.getByRole('dialog', { name: 'Participantes' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Limpiar' }));

    expect(onToggle).toHaveBeenCalledWith('item-2');
    expect(onToggle).toHaveBeenCalledWith('item-4');
  });
});
