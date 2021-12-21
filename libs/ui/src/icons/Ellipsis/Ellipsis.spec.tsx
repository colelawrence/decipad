import { render } from '@testing-library/react';
import { Ellipsis } from './Ellipsis';

it('renders a ellipsis icon', () => {
  const { getByTitle } = render(<Ellipsis />);
  expect(getByTitle(/ellipsis/i)).toBeInTheDocument();
});
