import { render } from '@testing-library/react';
import { Chat } from './Chat';

it('renders a chat icon', () => {
  const { getByTitle } = render(<Chat />);
  expect(getByTitle(/chat/i)).toBeInTheDocument();
});
