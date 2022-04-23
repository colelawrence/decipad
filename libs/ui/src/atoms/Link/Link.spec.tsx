import { findParentWithStyle } from '@decipad/dom-test-utils';
import { render } from '@testing-library/react';
import { Link } from './Link';

it('renders the children linking to the href', () => {
  const { getByText } = render(<Link href="#href">text</Link>);
  expect(getByText('text').closest('a')).toHaveAttribute(
    'href',
    expect.stringMatching(/#href$/)
  );
  expect(findParentWithStyle(getByText('text'), 'color')!.color).toContain(
    'rgb'
  );
});
