import { render, screen } from '@testing-library/react';
import { ImportRangeCopies } from './ImportRangeCopies';

it('renders a ImportRangeCopies icon', () => {
  render(<ImportRangeCopies />);
  expect(screen.getByTitle(/range/i)).toBeInTheDocument();
});
