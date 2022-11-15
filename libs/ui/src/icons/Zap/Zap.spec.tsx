import { render, screen } from '@testing-library/react';
import { Zap } from './Zap';

it('renders a zap icon', () => {
  render(<Zap />);
  expect(screen.getByTitle(/zap/i)).toBeInTheDocument();
});
