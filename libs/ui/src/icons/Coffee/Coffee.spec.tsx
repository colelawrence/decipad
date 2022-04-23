import { render } from '@testing-library/react';
import { Coffee } from './Coffee';

it('renders a clock icon', () => {
  const { getByTitle } = render(<Coffee />);
  expect(getByTitle(/coffee/i)).toBeInTheDocument();
});
