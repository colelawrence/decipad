import { render } from '@testing-library/react';
import { Car } from './Car';

it('renders a car icon', () => {
  const { getByTitle } = render(<Car />);
  expect(getByTitle(/car/i)).toBeInTheDocument();
});
