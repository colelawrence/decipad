import { render } from '@testing-library/react';
import { Server } from './Server';

it('renders a server icon', () => {
  const { getByTitle } = render(<Server />);
  expect(getByTitle(/server/i)).toBeInTheDocument();
});
