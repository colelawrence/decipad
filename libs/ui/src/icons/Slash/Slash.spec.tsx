import { render, screen } from '@testing-library/react';
import { Slash } from './Slash';

it('renders a slash icon', () => {
  render(<Slash />);
  expect(screen.getByTitle(/slash/i)).toBeInTheDocument();
});
