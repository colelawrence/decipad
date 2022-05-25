import { findParentWithStyle } from '@decipad/dom-test-utils';
import { render, screen } from '@testing-library/react';
import { InlineCode } from './InlineCode';

it('renders the children as code', () => {
  render(<InlineCode>text</InlineCode>);
  expect(
    findParentWithStyle(screen.getByText('text'), 'fontFamily')!.fontFamily
  ).toContain('monospace');
});
