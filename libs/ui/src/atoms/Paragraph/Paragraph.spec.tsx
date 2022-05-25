import { findParentWithStyle } from '@decipad/dom-test-utils';
import { BlockIsActiveProvider } from '@decipad/react-contexts';
import { render, screen } from '@testing-library/react';
import { Paragraph } from './Paragraph';

it('renders the children', () => {
  const { container } = render(<Paragraph>text</Paragraph>);
  expect(container).toHaveTextContent('text');
});

it('assigns a given placeholder', () => {
  render(<Paragraph placeholder="text goes here">text</Paragraph>);
  expect(screen.getByText('text').closest('p')).toHaveAttribute(
    'aria-placeholder',
    'text goes here'
  );
});

describe('when active', () => {
  it('has a different background', () => {
    const { rerender } = render(<Paragraph>text</Paragraph>);
    const normalBoxShadow = findParentWithStyle(
      screen.getByText('text'),
      'boxShadow'
    )?.boxShadow;

    rerender(
      <BlockIsActiveProvider>
        <Paragraph>text</Paragraph>
      </BlockIsActiveProvider>
    );
    const activeBoxShadow = findParentWithStyle(
      screen.getByText('text'),
      'boxShadow'
    )?.boxShadow;
    expect(activeBoxShadow).not.toEqual(normalBoxShadow);
  });
});
