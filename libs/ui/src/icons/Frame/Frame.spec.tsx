import { render, screen } from '@testing-library/react';
import { Frame } from './Frame';

it('renders a frame icon', () => {
  render(<Frame />);
  expect(screen.getByTitle(/frame/i)).toBeInTheDocument();
});
