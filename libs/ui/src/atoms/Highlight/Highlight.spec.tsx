import { findParentWithStyle } from '@decipad/dom-test-utils';
import { render } from '@testing-library/react';
import { Highlight } from './Highlight';

it('renders the children as highlight', () => {
  const { getByText } = render(<Highlight>text</Highlight>);
  expect(getByText('text').textContent).toContain('text');

  expect(
    findParentWithStyle(getByText('text'), 'borderRadius')!.borderRadius
  ).toContain('px');
});
