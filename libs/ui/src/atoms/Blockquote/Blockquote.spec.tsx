import { findParentWithStyle } from '@decipad/dom-test-utils';
import { BlockIsActiveProvider } from '@decipad/react-contexts';
import { render, screen } from '@testing-library/react';
import { Blockquote } from './Blockquote';

it('renders the children', () => {
  const { container } = render(<Blockquote>text</Blockquote>);
  expect(container).toHaveTextContent('text');
});

describe('when active', () => {
  it('has a different background', () => {
    const { rerender } = render(<Blockquote>text</Blockquote>);
    const normalBoxShadow = findParentWithStyle(
      screen.getByText('text'),
      'boxShadow'
    )?.boxShadow;

    rerender(
      <BlockIsActiveProvider>
        <Blockquote>text</Blockquote>
      </BlockIsActiveProvider>
    );
    const activeBoxShadow = findParentWithStyle(
      screen.getByText('text'),
      'boxShadow'
    )?.boxShadow;
    expect(activeBoxShadow).not.toEqual(normalBoxShadow);
  });
});
