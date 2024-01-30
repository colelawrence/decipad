import { findParentWithStyle } from '@decipad/dom-test-utils';
import { render, screen } from '@testing-library/react';
import { Underline } from './Underline';

it('renders the children underlined', () => {
  render(<Underline>text</Underline>);
  expect(
    findParentWithStyle(screen.getByText('text'), 'textDecoration')!
      .textDecoration
  ).toBe('underline');
});
