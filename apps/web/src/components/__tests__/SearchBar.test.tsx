import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  it('submits the current query', async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();

    render(<SearchBar onSearch={onSearch} />);

    await user.type(
      screen.getByPlaceholderText('Buscar por nombre, unidad, palabras claves'),
      'energias renovables',
    );
    await user.click(screen.getByRole('button'));

    expect(onSearch).toHaveBeenCalledWith('energias renovables');
  });

  it('starts with the provided initial value', () => {
    render(<SearchBar initialValue="UCR" />);

    expect(screen.getByDisplayValue('UCR')).toBeInTheDocument();
  });
});
