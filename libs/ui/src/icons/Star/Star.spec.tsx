import { render } from '@testing-library/react';
import { Star } from './Star';

it('renders a star icon', () => {
  const { getByTitle } = render(<Star />);
  expect(getByTitle(/star/i)).toBeInTheDocument();
});
