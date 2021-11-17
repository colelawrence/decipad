import { render } from '@testing-library/react';
import { Link } from './Link';

it('renders a link icon', () => {
  const { getByTitle } = render(<Link />);
  expect(getByTitle(/link/i)).toBeInTheDocument();
});
