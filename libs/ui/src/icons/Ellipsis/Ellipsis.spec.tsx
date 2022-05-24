import { render, screen } from '@testing-library/react';
import { Ellipsis } from './Ellipsis';

it('renders a ellipsis icon', () => {
  render(<Ellipsis />);
  expect(screen.getByTitle(/ellipsis/i)).toBeInTheDocument();
});
