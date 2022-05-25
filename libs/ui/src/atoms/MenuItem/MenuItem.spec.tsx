import { applyCssVars, findParentWithStyle } from '@decipad/dom-test-utils';
import { mockConsoleWarn } from '@decipad/testutils';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MenuWrapper as wrapper } from '../../test-utils';
import { MenuItem } from './MenuItem';

let user = userEvent.setup({ pointerEventsCheck: 0 });
beforeEach(() => {
  user = userEvent.setup({ pointerEventsCheck: 0 });
});

it('renders the children', () => {
  render(<MenuItem>Text</MenuItem>, { wrapper });
  expect(screen.getByText('Text')).toBeInTheDocument();
});

it('is clickable', async () => {
  const handleSelect = jest.fn();
  render(<MenuItem onSelect={handleSelect}>Text</MenuItem>, { wrapper });

  await user.click(screen.getByRole('menuitem'));
  expect(handleSelect).toHaveBeenCalled();
});

it('renders an optional icon', () => {
  render(
    <MenuItem
      icon={
        <svg>
          <title>Pretty Icon</title>
        </svg>
      }
    >
      Text
    </MenuItem>,
    { wrapper }
  );
  expect(screen.getByTitle('Pretty Icon')).toBeInTheDocument();
});

mockConsoleWarn();
let cleanup: undefined | (() => void);
afterEach(() => cleanup?.());

describe('selected prop', () => {
  it('highlights the menu item as selected', async () => {
    const { rerender } = render(<MenuItem>Text</MenuItem>, {
      wrapper,
    });

    cleanup = await applyCssVars();

    const { backgroundColor: normalBackgroundColor } = findParentWithStyle(
      screen.getByRole('menuitem'),
      'backgroundColor'
    )!;

    rerender(<MenuItem selected>Text</MenuItem>);

    const { backgroundColor: highlightBackgroundColor } = findParentWithStyle(
      screen.getByRole('menuitem'),
      'backgroundColor'
    )!;

    expect(normalBackgroundColor).not.toEqual(highlightBackgroundColor);
  });
});
