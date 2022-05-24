import { render, screen } from '@testing-library/react';
import { Server } from './Server';

it('renders a server icon', () => {
  render(<Server />);
  expect(screen.getByTitle(/server/i)).toBeInTheDocument();
});
