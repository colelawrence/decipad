import { render, screen } from '@testing-library/react';
import { DollarCircle } from './DollarCircle';

it('renders a dollar circle icon', () => {
  render(<DollarCircle />);
  expect(screen.getByTitle(/dollar circle/i)).toBeInTheDocument();
});
