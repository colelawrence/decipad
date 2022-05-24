import { render, screen } from '@testing-library/react';
import { Add } from './Add';

it('renders an "add" icon', () => {
  render(<Add />);
  expect(screen.getByTitle(/add/i)).toBeInTheDocument();
});
