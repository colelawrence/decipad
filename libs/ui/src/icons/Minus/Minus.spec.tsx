import { render } from '@testing-library/react';
import { Minus } from './Minus';

it('renders a minus icon', () => {
  const { getByTitle } = render(<Minus />);
  expect(getByTitle(/minus/i)).toBeInTheDocument();
});
