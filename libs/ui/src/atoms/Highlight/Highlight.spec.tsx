import { findParentWithStyle } from '@decipad/dom-test-utils';
import { render, screen } from '@testing-library/react';
import { Highlight } from './Highlight';

it('renders the children as highlight', () => {
  render(<Highlight>text</Highlight>);
  expect(screen.getByText('text').textContent).toContain('text');

  expect(
    findParentWithStyle(screen.getByText('text'), 'borderRadius')!.borderRadius
  ).toContain('em');
});
