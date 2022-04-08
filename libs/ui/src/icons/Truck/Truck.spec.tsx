import { render } from '@testing-library/react';
import { Truck } from './Truck';

it('renders a truck icon', () => {
  const { getByTitle } = render(<Truck />);
  expect(getByTitle(/truck/i)).toBeInTheDocument();
});
