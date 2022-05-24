import { render, screen } from '@testing-library/react';
import { Leaf } from './Leaf';

it('renders a leaf icon', () => {
  render(<Leaf />);
  expect(screen.getByTitle(/leaf/i)).toBeInTheDocument();
});
