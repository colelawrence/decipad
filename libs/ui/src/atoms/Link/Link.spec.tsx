import { findParentWithStyle } from '@decipad/dom-test-utils';
import { render, screen } from '@testing-library/react';
import { Link } from './Link';

it('renders the children linking to the href', () => {
  render(<Link href="#href">text</Link>);
  expect(screen.getByText('text').closest('a')).toHaveAttribute(
    'href',
    expect.stringMatching(/#href$/)
  );
  expect(
    findParentWithStyle(screen.getByText('text'), 'color')!.color
  ).toContain('rgb');
});
