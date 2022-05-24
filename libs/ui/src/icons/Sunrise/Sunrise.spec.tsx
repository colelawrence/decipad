import { render, screen } from '@testing-library/react';
import { Sunrise } from './Sunrise';

it('renders a sunrise icon', () => {
  render(<Sunrise />);
  expect(screen.getByTitle(/sunrise/i)).toBeInTheDocument();
});
