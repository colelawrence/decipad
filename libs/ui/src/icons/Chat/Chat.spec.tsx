import { render, screen } from '@testing-library/react';
import { Chat } from './Chat';

it('renders a chat icon', () => {
  render(<Chat />);
  expect(screen.getByTitle(/chat/i)).toBeInTheDocument();
});
