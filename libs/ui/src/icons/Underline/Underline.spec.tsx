import { render, screen } from '@testing-library/react';
import { Underline } from './Underline';

it('renders a underline icon', () => {
  render(<Underline />);
  expect(screen.getByTitle(/underline/i)).toBeInTheDocument();
});
