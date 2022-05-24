import { render, screen } from '@testing-library/react';
import { Bold } from './Bold';

it('renders a bold icon', () => {
  render(<Bold />);
  expect(screen.getByTitle(/bold/i)).toBeInTheDocument();
});
