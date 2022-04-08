import { render } from '@testing-library/react';
import { DollarCircle } from './DollarCircle';

it('renders a dollar circle icon', () => {
  const { getByTitle } = render(<DollarCircle />);
  expect(getByTitle(/dollar circle/i)).toBeInTheDocument();
});
