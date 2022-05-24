import { render, screen } from '@testing-library/react';
import { Input } from './Input';

it('renders a input icon', () => {
  render(<Input />);
  expect(screen.getByTitle(/input/i)).toBeInTheDocument();
});
