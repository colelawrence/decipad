import { findParentWithStyle } from '@decipad/dom-test-utils';
import { render, screen } from '@testing-library/react';
import { Strikethrough } from './Strikethrough';

it('renders the children striked through', () => {
  render(<Strikethrough>text</Strikethrough>);
  expect(
    findParentWithStyle(screen.getByText('text'), 'textDecoration')!
      .textDecoration
  ).toBe('line-through');
});
