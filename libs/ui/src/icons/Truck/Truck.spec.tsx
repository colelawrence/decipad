import { render, screen } from '@testing-library/react';
import { Truck } from './Truck';

it('renders a truck icon', () => {
  render(<Truck />);
  expect(screen.getByTitle(/truck/i)).toBeInTheDocument();
});
