import { render } from '@testing-library/react';
import { Pie } from './Pie';

it('renders a pie icon', () => {
  const { getByTitle } = render(<Pie />);
  expect(getByTitle(/pie/i)).toBeInTheDocument();
});
