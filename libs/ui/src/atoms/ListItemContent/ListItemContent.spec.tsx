import { findParentWithStyle } from '@decipad/dom-test-utils';
import { BlockIsActiveProvider } from '@decipad/react-contexts';
import { render, screen } from '@testing-library/react';
import { ListItemContent } from './ListItemContent';

it('renders the children', () => {
  render(<ListItemContent>text</ListItemContent>);
  expect(screen.getByText('text')).toBeVisible();
});

describe('when active', () => {
  it('has a different background', () => {
    const { rerender } = render(<ListItemContent>text</ListItemContent>);
    const normalBoxShadow = findParentWithStyle(
      screen.getByText('text'),
      'boxShadow'
    )?.boxShadow;

    rerender(
      <BlockIsActiveProvider>
        <ListItemContent>text</ListItemContent>
      </BlockIsActiveProvider>
    );
    const activeBoxShadow = findParentWithStyle(
      screen.getByText('text'),
      'boxShadow'
    )?.boxShadow;
    expect(activeBoxShadow).not.toEqual(normalBoxShadow);
  });
});
