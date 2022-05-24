import { render, screen } from '@testing-library/react';
import { Chart } from './Chart';

it('renders a chart icon', () => {
  render(<Chart />);
  expect(screen.getByTitle(/chart/i)).toBeInTheDocument();
});
