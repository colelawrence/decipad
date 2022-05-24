import { render, screen } from '@testing-library/react';
import { Card } from './Card';

it('renders a card icon', () => {
  render(<Card />);
  expect(screen.getByTitle(/card/i)).toBeInTheDocument();
});
