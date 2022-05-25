import { render, screen } from '@testing-library/react';
import { EditorTitle } from './EditorTitle';

it('renders the title at given heading level', () => {
  render(<EditorTitle Heading="h1">text</EditorTitle>);
  expect(screen.getByRole('heading')).toHaveTextContent('text');
  expect(screen.getByRole('heading').tagName).toBe('H1');
});
