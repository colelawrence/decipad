import { findParentWithStyle } from '@decipad/dom-test-utils';
import { BlockIsActiveProvider } from '@decipad/react-contexts';
import { render, screen } from '@testing-library/react';
import { Heading2 } from './Heading2';

it('renders the children', () => {
  const { container } = render(
    <Heading2 id="1" Heading="h3">
      text
    </Heading2>
  );
  expect(container).toHaveTextContent('text');
});

describe('when active', () => {
  it('has a different background', () => {
    const { rerender } = render(
      <Heading2 id="1" Heading="h3">
        text
      </Heading2>
    );
    const normalBoxShadow = findParentWithStyle(
      screen.getByText('text'),
      'boxShadow'
    )?.boxShadow;

    rerender(
      <BlockIsActiveProvider>
        <Heading2 id="1" Heading="h3">
          text
        </Heading2>
      </BlockIsActiveProvider>
    );
    const activeBoxShadow = findParentWithStyle(
      screen.getByText('text'),
      'boxShadow'
    )?.boxShadow;
    expect(activeBoxShadow).not.toEqual(normalBoxShadow);
  });
});
