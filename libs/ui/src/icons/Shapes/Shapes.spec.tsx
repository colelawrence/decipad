import { render } from '@testing-library/react';
import { Shapes } from './Shapes';

it('renders a shapes icon', () => {
  const { getByTitle } = render(<Shapes />);
  expect(getByTitle(/shapes/i)).toBeInTheDocument();
});
