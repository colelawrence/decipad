import { render, screen } from '@testing-library/react';
import { Trophy } from './Trophy';

it('renders a trophy icon', () => {
  render(<Trophy />);
  expect(screen.getByTitle(/trophy/i)).toBeInTheDocument();
});
