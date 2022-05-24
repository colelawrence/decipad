import { render, screen } from '@testing-library/react';
import { Sparkles } from './Sparkles';

it('renders a sparkles icon', () => {
  render(<Sparkles />);
  expect(screen.getByTitle(/sparkles/i)).toBeInTheDocument();
});
