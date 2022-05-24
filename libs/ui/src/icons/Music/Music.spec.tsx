import { render, screen } from '@testing-library/react';
import { Music } from './Music';

it('renders a music icon', () => {
  render(<Music />);
  expect(screen.getByTitle(/music/i)).toBeInTheDocument();
});
