import { render, screen } from '@testing-library/react';
import { EditorColumns } from './EditorColumns';

it('render children', () => {
  render(<EditorColumns>text</EditorColumns>);
  expect(screen.getByText('text')).toBeVisible();
});
