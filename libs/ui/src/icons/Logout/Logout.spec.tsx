import { render } from '@testing-library/react';
import { Logout } from './Logout';

it('renders a logout icon', () => {
  const { getByTitle } = render(<Logout />);
  expect(getByTitle(/log.*out/i)).toBeInTheDocument();
});
