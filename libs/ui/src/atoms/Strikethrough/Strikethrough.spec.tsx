import { render } from '@testing-library/react';
import { findParentWithStyle } from '@decipad/dom-test-utils';
import { Strikethrough } from './Strikethrough';

it('renders the children striked through', () => {
  const { getByText } = render(<Strikethrough>text</Strikethrough>);
  expect(
    findParentWithStyle(getByText('text'), 'textDecoration')!.textDecoration
  ).toBe('line-through');
});
