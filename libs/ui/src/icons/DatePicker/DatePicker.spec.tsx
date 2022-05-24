import { render, screen } from '@testing-library/react';
import { DatePicker } from './DatePicker';

it('renders a deci icon', () => {
  render(<DatePicker />);
  expect(screen.getByTitle(/datepicker/i)).toBeInTheDocument();
});
