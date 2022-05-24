import { render, screen } from '@testing-library/react';
import { Message } from './Message';

it('renders a message icon', () => {
  render(<Message />);
  expect(screen.getByTitle(/message/i)).toBeInTheDocument();
});
