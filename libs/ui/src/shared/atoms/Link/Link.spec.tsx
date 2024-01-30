import { render, screen } from '@testing-library/react';
import { Link } from './Link';

it('renders the children linking to the href', () => {
  render(<Link href="#href">text</Link>);
  expect(screen.getByText('text').closest('a')).toHaveAttribute(
    'href',
    expect.stringMatching(/#href$/)
  );
});
