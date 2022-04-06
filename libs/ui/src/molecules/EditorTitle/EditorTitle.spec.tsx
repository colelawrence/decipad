import { render } from '@testing-library/react';
import { EditorTitle } from './EditorTitle';

it('renders the title at given heading level', () => {
  const { getByRole } = render(<EditorTitle Heading="h1">text</EditorTitle>);
  expect(getByRole('heading')).toHaveTextContent('text');
  expect(getByRole('heading').tagName).toBe('H1');
});
