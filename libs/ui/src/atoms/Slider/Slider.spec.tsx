import { render, screen } from '@testing-library/react';
import { Slider } from './Slider';

it('renders a slider', () => {
  render(<Slider />);
  expect(screen.getByRole('slider')).toBeVisible();
});
