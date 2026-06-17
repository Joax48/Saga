import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import FilterSection from '../FilterSection';

describe('projects/FilterSection', () => {
  const options = [
    { label: 'Aplicada', count: 4, value: 'aplicada' },
    { label: 'Basica', count: 2, value: 'basica' },
    { label: 'Extension', count: 1, value: 'extension' },
  ];

  it('toggles an option and respects selected values', async () => {
    const user = userEvent.setup();
    const onToggleOption = jest.fn();

    render(
      <FilterSection
        title="Tipo"
        options={options}
        selectedValues={['basica']}
        onToggleOption={onToggleOption}
        initialVisible={2}
      />,
    );

    const selectedOption = screen.getByRole('checkbox', { name: /Basica \(2\)/i });
    expect(selectedOption).toBeChecked();

    await user.click(screen.getByRole('checkbox', { name: /Aplicada \(4\)/i }));

    expect(onToggleOption).toHaveBeenCalledWith('aplicada');
  });

  it('shows more options and can collapse the section', async () => {
    const user = userEvent.setup();

    render(
      <FilterSection
        title="Estado"
        options={options}
        selectedValues={[]}
        onToggleOption={jest.fn()}
        initialVisible={2}
      />,
    );

    expect(screen.queryByText('Extension (1)')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Mostrar/i }));
    expect(screen.getByText('Extension (1)')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ocultar Estado' }));
    expect(screen.queryByText('Aplicada (4)')).not.toBeInTheDocument();
  });
});
