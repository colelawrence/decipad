import { render, screen } from '@testing-library/react';
import { TableSlash } from './TableSlash';

it('renders a table icon for slash commands', () => {
  render(<TableSlash />);
  expect(screen.getByTitle(/tableslash/i)).toBeInTheDocument();
});
