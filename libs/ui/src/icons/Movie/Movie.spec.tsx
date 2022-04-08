import { render } from '@testing-library/react';
import { Movie } from './Movie';

it('renders a movie icon', () => {
  const { getByTitle } = render(<Movie />);
  expect(getByTitle(/movie/i)).toBeInTheDocument();
});
