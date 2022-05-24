import { render, screen } from '@testing-library/react';
import { Trash } from './Trash';

it('renders a trash icon', () => {
  render(<Trash />);
  expect(screen.getByTitle(/trash/i)).toBeInTheDocument();
});
