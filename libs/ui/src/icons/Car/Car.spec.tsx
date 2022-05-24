import { render, screen } from '@testing-library/react';
import { Car } from './Car';

it('renders a car icon', () => {
  render(<Car />);
  expect(screen.getByTitle(/car/i)).toBeInTheDocument();
});
