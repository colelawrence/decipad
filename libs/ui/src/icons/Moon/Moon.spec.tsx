import { render } from '@testing-library/react';
import { Moon } from './Moon';

it('renders a moon icon', () => {
  const { getByTitle } = render(<Moon />);
  expect(getByTitle(/moon/i)).toBeInTheDocument();
});
