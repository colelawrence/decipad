import { render, screen } from '@testing-library/react';
import { Slider } from './Slider';

it('renders a slider icon', () => {
  render(<Slider />);
  expect(screen.getByTitle(/slider/i)).toBeInTheDocument();
});
