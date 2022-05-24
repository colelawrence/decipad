import { render, screen } from '@testing-library/react';
import { Crown } from './Crown';

it('renders a crown icon', () => {
  render(<Crown />);
  expect(screen.getByTitle(/crown/i)).toBeInTheDocument();
});
