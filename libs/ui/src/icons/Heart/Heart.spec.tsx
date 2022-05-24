import { render, screen } from '@testing-library/react';
import { Heart } from './Heart';

it('renders a heart icon', () => {
  render(<Heart />);
  expect(screen.getByTitle(/heart/i)).toBeInTheDocument();
});
