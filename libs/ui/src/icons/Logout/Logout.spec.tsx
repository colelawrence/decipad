import { render, screen } from '@testing-library/react';
import { Logout } from './Logout';

it('renders a logout icon', () => {
  render(<Logout />);
  expect(screen.getByTitle(/log.*out/i)).toBeInTheDocument();
});
