import { render } from '@testing-library/react';
import { BackButton } from './BackButton';

describe('Back Button', () => {
  it('renders the left arrow icon with given link', () => {
    const { getByTitle } = render(<BackButton href="/back" />);

    expect(getByTitle(/left arrow/i).closest('a')).toHaveAttribute(
      'href',
      '/back'
    );
  });
});
