import { findParentWithStyle } from '@decipad/dom-test-utils';
import { BlockIsActiveProvider } from '@decipad/react-contexts';
import { render } from '@testing-library/react';
import { Heading1 } from './Heading1';

it('renders the children', () => {
  const { container } = render(<Heading1 Heading="h2">text</Heading1>);
  expect(container).toHaveTextContent('text');
});

describe('when active', () => {
  it('has a different background', () => {
    const { getByText, rerender } = render(
      <Heading1 Heading="h2">text</Heading1>
    );
    const normalBoxShadow = findParentWithStyle(
      getByText('text'),
      'boxShadow'
    )?.boxShadow;

    rerender(
      <BlockIsActiveProvider>
        <Heading1 Heading="h2">text</Heading1>
      </BlockIsActiveProvider>
    );
    const activeBoxShadow = findParentWithStyle(
      getByText('text'),
      'boxShadow'
    )?.boxShadow;
    expect(activeBoxShadow).not.toEqual(normalBoxShadow);
  });
});
