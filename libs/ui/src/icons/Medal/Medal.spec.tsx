import { render, screen } from '@testing-library/react';
import { Medal } from './Medal';

it('renders a medal icon', () => {
  render(<Medal />);
  expect(screen.getByTitle(/medal/i)).toBeInTheDocument();
});
