import { render, screen } from '@testing-library/react';
import { Pin } from './Pin';

it('renders a pin icon', () => {
  render(<Pin />);
  expect(screen.getByTitle(/pin/i)).toBeInTheDocument();
});
