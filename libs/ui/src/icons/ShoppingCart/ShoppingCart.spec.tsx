import { render, screen } from '@testing-library/react';
import { ShoppingCart } from './ShoppingCart';

it('renders a shopping cart icon', () => {
  render(<ShoppingCart />);
  expect(screen.getByTitle(/shopping cart/i)).toBeInTheDocument();
});
