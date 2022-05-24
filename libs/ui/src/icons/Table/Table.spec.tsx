import { render, screen } from '@testing-library/react';
import { Table } from './Table';

it('renders a table icon', () => {
  render(<Table />);
  expect(screen.getByTitle(/table/i)).toBeInTheDocument();
});
