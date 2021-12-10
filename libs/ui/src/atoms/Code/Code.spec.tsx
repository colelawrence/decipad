import { render } from '@testing-library/react';
import { findParentWithStyle } from '@decipad/dom-test-utils';
import { Code } from './Code';

it('renders the children as code', () => {
  const { getByText } = render(<Code>text</Code>);
  expect(
    findParentWithStyle(getByText('text'), 'fontFamily')!.fontFamily
  ).toContain('monospace');
});
