import { render, screen } from '@testing-library/react';
import { Link } from './Link';

it('renders a link icon', () => {
  // eslint-disable-next-line jsx-a11y/anchor-is-valid
  render(<Link />);
  expect(screen.getByTitle(/link/i)).toBeInTheDocument();
});
