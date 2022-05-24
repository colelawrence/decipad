import { render, screen } from '@testing-library/react';
import { Star } from './Star';

it('renders a star icon', () => {
  render(<Star />);
  expect(screen.getByTitle(/star/i)).toBeInTheDocument();
});
