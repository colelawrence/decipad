import { render, screen } from '@testing-library/react';
import { Clock } from './Clock';

it('renders a clock icon', () => {
  render(<Clock />);
  expect(screen.getByTitle(/clock/i)).toBeInTheDocument();
});
