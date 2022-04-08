import { render } from '@testing-library/react';
import { Medal } from './Medal';

it('renders a medal icon', () => {
  const { getByTitle } = render(<Medal />);
  expect(getByTitle(/medal/i)).toBeInTheDocument();
});
