import { render, screen } from '@testing-library/react';
import { Minus } from './Minus';

it('renders a minus icon', () => {
  render(<Minus />);
  expect(screen.getByTitle(/minus/i)).toBeInTheDocument();
});
