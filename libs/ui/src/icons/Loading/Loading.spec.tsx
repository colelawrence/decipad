import { render, screen } from '@testing-library/react';
import { Loading } from './Loading';

it('renders a server icon', () => {
  render(<Loading />);
  expect(screen.getByTitle(/loading/i)).toBeInTheDocument();
});
