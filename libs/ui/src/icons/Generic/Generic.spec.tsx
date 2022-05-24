import { render, screen } from '@testing-library/react';
import { Generic } from './Generic';

it('renders a generic icon', () => {
  render(<Generic />);
  expect(screen.getByTitle(/generic/i)).toBeInTheDocument();
});
