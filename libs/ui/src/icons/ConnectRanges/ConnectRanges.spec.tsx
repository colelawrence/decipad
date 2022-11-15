import { render, screen } from '@testing-library/react';
import { ConnectRanges } from './ConnectRanges';

it('renders a ConnectRanges icon', () => {
  render(<ConnectRanges />);
  expect(screen.getByTitle(/ranges/i)).toBeInTheDocument();
});
