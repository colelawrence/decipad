import { render, screen } from '@testing-library/react';
import { Delete } from './Delete';

it('renders a delete icon', () => {
  render(<Delete />);
  expect(screen.getByTitle(/delete/i)).toBeInTheDocument();
});
