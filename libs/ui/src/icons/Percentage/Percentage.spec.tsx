import { render, screen } from '@testing-library/react';
import { Percentage } from './Percentage';

it('renders a percentage icon', () => {
  render(<Percentage />);
  expect(screen.getByTitle(/percentage/i)).toBeInTheDocument();
});
