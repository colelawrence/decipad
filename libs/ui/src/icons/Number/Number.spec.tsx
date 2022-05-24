import { render, screen } from '@testing-library/react';
import { Number } from './Number';

it('renders a number icon', () => {
  render(<Number />);
  expect(screen.getByTitle(/number/i)).toBeInTheDocument();
});
