import { render } from '@testing-library/react';
import { Music } from './Music';

it('renders a music icon', () => {
  const { getByTitle } = render(<Music />);
  expect(getByTitle(/music/i)).toBeInTheDocument();
});
