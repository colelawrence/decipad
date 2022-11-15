import { render, screen } from '@testing-library/react';
import { ImportTable } from './ImportTable';

it('renders a ImportTable icon', () => {
  render(<ImportTable />);
  expect(screen.getByTitle(/table/i)).toBeInTheDocument();
});
