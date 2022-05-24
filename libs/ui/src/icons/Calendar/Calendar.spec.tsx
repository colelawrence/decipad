import { render, screen } from '@testing-library/react';
import { Calendar } from './Calendar';

it('renders a calendar icon', () => {
  render(<Calendar />);
  expect(screen.getByTitle(/calendar/i)).toBeInTheDocument();
});
