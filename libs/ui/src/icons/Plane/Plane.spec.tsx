import { render, screen } from '@testing-library/react';
import { Plane } from './Plane';

it('renders a plane icon', () => {
  render(<Plane />);
  expect(screen.getByTitle(/plane/i)).toBeInTheDocument();
});
