import { render, screen } from '@testing-library/react';
import { Health } from './Health';

it('renders a health icon', () => {
  render(<Health />);
  expect(screen.getByTitle(/health/i)).toBeInTheDocument();
});
