import { render, screen } from '@testing-library/react';
import { Globe } from './Globe';

it('renders a globe icon', () => {
  render(<Globe />);
  expect(screen.getByTitle(/glob/i)).toBeInTheDocument();
});
