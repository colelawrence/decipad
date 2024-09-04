import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Blockquote } from './Blockquote';

describe('Blockquote', () => {
  it('renders the children', () => {
    const { container } = render(<Blockquote>text</Blockquote>);
    expect(container).toHaveTextContent('text');
  });
});
