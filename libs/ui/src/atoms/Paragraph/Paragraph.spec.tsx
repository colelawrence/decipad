import { findParentWithStyle } from '@decipad/dom-test-utils';
import { BlockIsActiveProvider } from '@decipad/react-contexts';
import { render } from '@testing-library/react';
import { Paragraph } from './Paragraph';

it('renders the children', () => {
  const { container } = render(<Paragraph>text</Paragraph>);
  expect(container).toHaveTextContent('text');
});

it('assigns a given placeholder', () => {
  const { getByText } = render(
    <Paragraph placeholder="text goes here">text</Paragraph>
  );
  expect(getByText('text').closest('p')).toHaveAttribute(
    'aria-placeholder',
    'text goes here'
  );
});

describe('when active', () => {
  it('has a different background', () => {
    const { getByText, rerender } = render(<Paragraph>text</Paragraph>);
    const normalBoxShadow = findParentWithStyle(
      getByText('text'),
      'boxShadow'
    )?.boxShadow;

    rerender(
      <BlockIsActiveProvider>
        <Paragraph>text</Paragraph>
      </BlockIsActiveProvider>
    );
    const activeBoxShadow = findParentWithStyle(
      getByText('text'),
      'boxShadow'
    )?.boxShadow;
    expect(activeBoxShadow).not.toEqual(normalBoxShadow);
  });
});
