import { render, screen } from '@testing-library/react';
import { LightBulb } from './LightBulb';

it('renders a lightbulb icon', () => {
  render(<LightBulb />);
  expect(screen.getByTitle(/lightbulb/i)).toBeInTheDocument();
});
