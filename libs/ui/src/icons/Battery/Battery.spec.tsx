import { render, screen } from '@testing-library/react';
import { Battery } from './Battery';

it('renders a battery icon', () => {
  render(<Battery />);
  expect(screen.getByTitle(/battery/i)).toBeInTheDocument();
});
