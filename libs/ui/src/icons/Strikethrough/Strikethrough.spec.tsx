import { render, screen } from '@testing-library/react';
import { Strikethrough } from './Strikethrough';

it('renders a strikethrough icon', () => {
  render(<Strikethrough />);
  expect(screen.getByTitle(/strikethrough/i)).toBeInTheDocument();
});
