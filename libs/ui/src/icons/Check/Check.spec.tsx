import { render, screen } from '@testing-library/react';
import { Check } from './Check';

it('renders a check icon', () => {
  render(<Check />);
  expect(screen.getByTitle(/check/i)).toBeInTheDocument();
});
