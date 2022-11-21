import { findParentWithStyle } from '@decipad/dom-test-utils';
import { BlockIsActiveProvider } from '@decipad/react-contexts';
import { render, screen } from '@testing-library/react';
import { Heading1 } from './Heading1';

it('renders the children', () => {
  const { container } = render(
    <Heading1 id="1" Heading="h2">
      text
    </Heading1>
  );
  expect(container).toHaveTextContent('text');
});

describe('when active', () => {
  it('has a different background', () => {
    const { rerender } = render(
      <Heading1 id="1" Heading="h2">
        text
      </Heading1>
    );
    const normalBoxShadow = findParentWithStyle(
      screen.getByText('text'),
      'boxShadow'
    )?.boxShadow;

    rerender(
      <BlockIsActiveProvider>
        <Heading1 id="1" Heading="h2">
          text
        </Heading1>
      </BlockIsActiveProvider>
    );
    const activeBoxShadow = findParentWithStyle(
      screen.getByText('text'),
      'boxShadow'
    )?.boxShadow;
    expect(activeBoxShadow).not.toEqual(normalBoxShadow);
  });
});
