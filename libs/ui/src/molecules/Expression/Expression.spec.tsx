import { render, screen } from '@testing-library/react';
import { Expression } from './Expression';

describe('Caption Molecule', () => {
  it('renders the children', () => {
    render(<Expression>children</Expression>);
    expect(screen.getByText('children')).toBeInTheDocument();
  });

  it('renders a placeholder', () => {
    render(<Expression placeholder="placeholder">children</Expression>);
    const textElement = screen.getByText('children');
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
    render(<Expression error={error}>children</Expression>);
    expect(screen.getByTitle('some error')).toBeInTheDocument();
  });

  it('scrolls left when loses focus', () => {
    const { rerender } = render(<Expression focused>some text</Expression>);
    rerender(<Expression focused={false}>some text</Expression>);
    expect(screen.getByText('some text').scrollLeft).toBe(0);
  });
});
