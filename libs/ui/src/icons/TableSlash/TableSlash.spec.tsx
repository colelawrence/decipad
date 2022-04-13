import { render } from '@testing-library/react';
import { TableSlash } from './TableSlash';

it('renders a table icon for slash commands', () => {
  const { getByTitle } = render(<TableSlash />);
  expect(getByTitle(/tableslash/i)).toBeInTheDocument();
});
