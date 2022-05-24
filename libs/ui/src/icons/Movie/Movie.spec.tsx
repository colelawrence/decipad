import { render, screen } from '@testing-library/react';
import { Movie } from './Movie';

it('renders a movie icon', () => {
  render(<Movie />);
  expect(screen.getByTitle(/movie/i)).toBeInTheDocument();
});
