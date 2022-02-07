import { render } from '@testing-library/react';
import { Calendar } from './Calendar';

it('renders a calendar icon', () => {
  const { getByTitle } = render(<Calendar />);
  expect(getByTitle(/calendar/i)).toBeInTheDocument();
});
