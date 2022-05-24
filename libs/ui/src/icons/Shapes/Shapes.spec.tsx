import { render, screen } from '@testing-library/react';
import { Shapes } from './Shapes';

it('renders a shapes icon', () => {
  render(<Shapes />);
  expect(screen.getByTitle(/shapes/i)).toBeInTheDocument();
});
