import { render, screen } from '@testing-library/react';
import { Sketch } from './Sketch';

it('renders a slash icon', () => {
  render(<Sketch />);
  expect(screen.getByTitle(/sketch/i)).toBeInTheDocument();
});
