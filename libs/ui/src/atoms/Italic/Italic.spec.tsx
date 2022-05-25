import { findParentWithStyle } from '@decipad/dom-test-utils';
import { render, screen } from '@testing-library/react';
import { Italic } from './Italic';

it('renders the children in italic', () => {
  render(<Italic>text</Italic>);
  expect(
    findParentWithStyle(screen.getByText('text'), 'fontStyle')!.fontStyle
  ).toBe('italic');
});
