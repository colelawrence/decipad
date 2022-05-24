import { render, screen } from '@testing-library/react';
import { Pie } from './Pie';

it('renders a pie icon', () => {
  render(<Pie />);
  expect(screen.getByTitle(/pie/i)).toBeInTheDocument();
});
