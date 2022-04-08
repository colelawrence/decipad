import { render } from '@testing-library/react';
import { ShoppingCart } from './ShoppingCart';

it('renders a shopping cart icon', () => {
  const { getByTitle } = render(<ShoppingCart />);
  expect(getByTitle(/shopping cart/i)).toBeInTheDocument();
});
