import { render } from '@testing-library/react';
import { Pin } from './Pin';

it('renders a pin icon', () => {
  const { getByTitle } = render(<Pin />);
  expect(getByTitle(/pin/i)).toBeInTheDocument();
});
