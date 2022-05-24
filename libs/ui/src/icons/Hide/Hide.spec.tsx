import { render, screen } from '@testing-library/react';
import { Hide } from './Hide';

it('renders a hide icon', () => {
  render(<Hide />);
  expect(screen.getByTitle(/hide/i)).toBeInTheDocument();
});
