import { render, screen } from '@testing-library/react';
import { World } from './World';

it('renders a world icon', () => {
  render(<World />);
  expect(screen.getByTitle(/world/i)).toBeInTheDocument();
});
