import { findParentWithStyle } from '@decipad/dom-test-utils';
import { BlockIsActiveProvider } from '@decipad/react-contexts';
import { render } from '@testing-library/react';
import { ListItemContent } from './ListItemContent';

it('renders the children', () => {
  const { getByText } = render(<ListItemContent>text</ListItemContent>);
  expect(getByText('text')).toBeVisible();
});

describe('when active', () => {
  it('has a different background', () => {
    const { getByText, rerender } = render(
      <ListItemContent>text</ListItemContent>
    );
    const normalBoxShadow = findParentWithStyle(
      getByText('text'),
      'boxShadow'
    )?.boxShadow;

    rerender(
      <BlockIsActiveProvider>
        <ListItemContent>text</ListItemContent>
      </BlockIsActiveProvider>
    );
    const activeBoxShadow = findParentWithStyle(
      getByText('text'),
      'boxShadow'
    )?.boxShadow;
    expect(activeBoxShadow).not.toEqual(normalBoxShadow);
  });
});
