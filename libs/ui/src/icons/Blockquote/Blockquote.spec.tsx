import { render, screen } from '@testing-library/react';
import { Blockquote } from './Blockquote';

it('renders a Blockquote icon', () => {
  render(<Blockquote />);
  expect(screen.getByTitle(/blockquote/i)).toBeInTheDocument();
});
