import { render, screen } from '@testing-library/react';
import { Beach } from './Beach';

it('renders a beach icon', () => {
  render(<Beach />);
  expect(screen.getByTitle(/beach/i)).toBeInTheDocument();
});
