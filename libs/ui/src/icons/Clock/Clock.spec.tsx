import { render } from '@testing-library/react';
import { Clock } from './Clock';

it('renders a clock icon', () => {
  const { getByTitle } = render(<Clock />);
  expect(getByTitle(/clock/i)).toBeInTheDocument();
});
