import { render } from '@testing-library/react';
import { Expression } from './Expression';

describe('Caption Molecule', () => {
  it('renders the children', () => {
    const { getByText } = render(<Expression>children</Expression>);
    expect(getByText('children')).toBeInTheDocument();
  });

  it('renders a placeholder', () => {
    const { getByText } = render(
      <Expression placeholder="placeholder">children</Expression>
    );
    const textElement = getByText('children');
    const wrapper = textElement.closest('div');

    expect(wrapper).toHaveAttribute(
      'aria-placeholder',
      expect.stringMatching('placeholder')
    );
  });

  it('renders error', () => {
    const error = {
      message: 'some error',
      url: 'some url',
    };
    const { getByTitle } = render(
      <Expression error={error}>children</Expression>
    );
    expect(getByTitle('some error')).toBeInTheDocument();
  });

  it('scrolls left when loses focus', () => {
    const { getByText, rerender } = render(
      <Expression focused>some text</Expression>
    );
    rerender(<Expression focused={false}>some text</Expression>);
    expect(getByText('some text').scrollLeft).toBe(0);
  });
});
