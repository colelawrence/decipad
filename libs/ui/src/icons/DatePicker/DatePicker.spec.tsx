import { render } from '@testing-library/react';
import { DatePicker } from './DatePicker';

it('renders a deci icon', () => {
  const { getByTitle } = render(<DatePicker />);
  expect(getByTitle(/datepicker/i)).toBeInTheDocument();
});
