import { render } from '@testing-library/react';
import { Percentage } from './Percentage';

it('renders a percentage icon', () => {
  const { getByTitle } = render(<Percentage />);
  expect(getByTitle(/percentage/i)).toBeInTheDocument();
});
