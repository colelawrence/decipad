import { render } from '@testing-library/react';
import { findParentWithStyle } from '@decipad/dom-test-utils';
import { InlineCode } from './InlineCode';

it('renders the children as code', () => {
  const { getByText } = render(<InlineCode>text</InlineCode>);
  expect(
    findParentWithStyle(getByText('text'), 'fontFamily')!.fontFamily
  ).toContain('monospace');
});
