import { render } from '@testing-library/react';
import { Crown } from './Crown';

it('renders a crown icon', () => {
  const { getByTitle } = render(<Crown />);
  expect(getByTitle(/crown/i)).toBeInTheDocument();
});
