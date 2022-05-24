import { render, screen } from '@testing-library/react';
import { People } from './People';

it('renders a people icon', () => {
  render(<People />);
  expect(screen.getByTitle(/people/i)).toBeInTheDocument();
});
