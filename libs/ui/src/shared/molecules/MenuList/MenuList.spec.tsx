import { mockConsoleError } from '@decipad/testutils';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MenuItem, TriggerMenuItem } from '../../atoms';
import { MenuList } from './MenuList';

mockConsoleError();

describe('the root MenuList', () => {
  describe('when open', () => {
    it('renders the menu items', () => {
      const { rerender } = render(
        <MenuList root>
          <MenuItem>item</MenuItem>
        </MenuList>
      );
      expect(screen.queryByText('item')).not.toBeInTheDocument();

      rerender(
        <MenuList root open>
          <MenuItem>item</MenuItem>
        </MenuList>
      );
      expect(screen.getByText('item')).toBeInTheDocument();
    });
  });

  it('cannot be rendered as a nested MenuList', () => {
    expect(() =>
      render(
        <MenuList root open>
          <MenuList root>{null}</MenuList>
        </MenuList>
      )
    ).toThrow(/root/i);
  });
});

describe('the dropdown root MenuList', () => {
  it('emits changeOpen events when the trigger is clicked', async () => {
    const handleChangeOpen = jest.fn();
    render(
      <MenuList
        root
        dropdown
        trigger={<button>trigger</button>}
        onChangeOpen={handleChangeOpen}
      >
        {null}
      </MenuList>
    );
    await userEvent.click(screen.getByText('trigger'), {
      pointerEventsCheck: 0,
    });
    expect(handleChangeOpen).toHaveBeenLastCalledWith(true);
  });

  describe('when open', () => {
    it('renders the menu items', () => {
      const { rerender } = render(
        <MenuList root dropdown trigger={<button>trigger</button>}>
          <MenuItem>item</MenuItem>
        </MenuList>
      );
      expect(screen.queryByText('item')).not.toBeInTheDocument();

      rerender(
        <MenuList root dropdown trigger={<button>trigger</button>} open>
          <MenuItem>item</MenuItem>
        </MenuList>
      );
      expect(screen.getByText('item')).toBeInTheDocument();
    });
  });
});

describe('the non-root MenuList', () => {
  it('cannot be rendered without a root MenuList', () => {
    expect(() =>
      render(
        <MenuList itemTrigger={<TriggerMenuItem>item</TriggerMenuItem>}>
          {null}
        </MenuList>
      )
    ).toThrow(/nest/i);
  });

  it('renders its trigger item', () => {
    render(
      <MenuList root open>
        <MenuList itemTrigger={<TriggerMenuItem>item</TriggerMenuItem>}>
          {null}
        </MenuList>
      </MenuList>
    );
    expect(screen.getByText('item')).toBeInTheDocument();
  });

  it('renders its menu items only when open', () => {
    const { rerender } = render(
      <MenuList root open>
        <MenuList itemTrigger={<TriggerMenuItem>item</TriggerMenuItem>}>
          <MenuItem>nested item</MenuItem>
        </MenuList>
      </MenuList>
    );
    expect(screen.queryByText('nested item')).not.toBeInTheDocument();

    rerender(
      <MenuList root open>
        <MenuList itemTrigger={<TriggerMenuItem>item</TriggerMenuItem>} open>
          <MenuItem>nested item</MenuItem>
        </MenuList>
      </MenuList>
    );
    expect(screen.getByText('nested item')).toBeInTheDocument();
  });

  it('can be uncontrolled', async () => {
    render(
      <MenuList root open>
        <MenuList itemTrigger={<TriggerMenuItem>item</TriggerMenuItem>}>
          <MenuItem>nested item</MenuItem>
        </MenuList>
      </MenuList>
    );
    expect(screen.queryByText('nested item')).not.toBeInTheDocument();

    await userEvent.click(screen.getByText('item'), {
      pointerEventsCheck: 0,
    });
    expect(screen.getByText('nested item')).toBeInTheDocument();
  });

  it('does not allow itemTriggers other than TriggerMenuItems', () => {
    expect(() =>
      render(
        <MenuList root open>
          <MenuList itemTrigger={<div />}>{null}</MenuList>
        </MenuList>
      )
    ).toThrow(/trigger/i);
  });
});
