import { render, screen } from '@testing-library/react';
import { Moon } from './Moon';

it('renders a moon icon', () => {
  render(<Moon />);
  expect(screen.getByTitle(/moon/i)).toBeInTheDocument();
});
