import { render } from '@testing-library/react';
import { Message } from './Message';

it('renders a message icon', () => {
  const { getByTitle } = render(<Message />);
  expect(getByTitle(/message/i)).toBeInTheDocument();
});
