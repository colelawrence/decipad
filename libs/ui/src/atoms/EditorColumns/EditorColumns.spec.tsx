import { render } from '@testing-library/react';
import { EditorColumns } from './EditorColumns';

it('render children', () => {
  const { getByText } = render(<EditorColumns>text</EditorColumns>);
  expect(getByText('text')).toBeVisible();
});
