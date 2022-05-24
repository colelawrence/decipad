import { render, screen } from '@testing-library/react';
import { Key } from './Key';

it('renders a key icon', () => {
  render(<Key />);
  expect(screen.getByTitle(/key/i)).toBeInTheDocument();
});
