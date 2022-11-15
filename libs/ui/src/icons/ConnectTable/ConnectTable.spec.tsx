import { render, screen } from '@testing-library/react';
import { ConnectTable } from './ConnectTable';

it('renders a ConnectTable icon', () => {
  render(<ConnectTable />);
  expect(screen.getByTitle(/table/i)).toBeInTheDocument();
});
