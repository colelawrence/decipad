import { render } from '@testing-library/react';
import { Heart } from './Heart';

it('renders a heart icon', () => {
  const { getByTitle } = render(<Heart />);
  expect(getByTitle(/heart/i)).toBeInTheDocument();
});
