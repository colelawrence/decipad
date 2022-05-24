import { render, screen } from '@testing-library/react';
import { Coffee } from './Coffee';

it('renders a clock icon', () => {
  render(<Coffee />);
  expect(screen.getByTitle(/coffee/i)).toBeInTheDocument();
});
