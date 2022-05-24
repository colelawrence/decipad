import { render, screen } from '@testing-library/react';
import { TV } from './TV';

it('renders a tv icon', () => {
  render(<TV />);
  expect(screen.getByTitle(/tv/i)).toBeInTheDocument();
});
