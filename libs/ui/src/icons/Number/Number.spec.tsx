import { render } from '@testing-library/react';
import { Number } from './Number';

it('renders a number icon', () => {
  const { getByTitle } = render(<Number />);
  expect(getByTitle(/number/i)).toBeInTheDocument();
});
