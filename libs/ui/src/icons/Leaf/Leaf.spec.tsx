import { render } from '@testing-library/react';
import { Leaf } from './Leaf';

it('renders a leaf icon', () => {
  const { getByTitle } = render(<Leaf />);
  expect(getByTitle(/leaf/i)).toBeInTheDocument();
});
