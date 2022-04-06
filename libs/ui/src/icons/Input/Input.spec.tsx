import { render } from '@testing-library/react';
import { Input } from './Input';

it('renders a input icon', () => {
  const { getByTitle } = render(<Input />);
  expect(getByTitle(/input/i)).toBeInTheDocument();
});
