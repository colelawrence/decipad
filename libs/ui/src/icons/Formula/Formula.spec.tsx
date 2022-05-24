import { render, screen } from '@testing-library/react';
import { Formula } from './Formula';

it('renders a formula icon', () => {
  render(<Formula />);
  expect(screen.getByTitle(/formula/i)).toBeInTheDocument();
});
