import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockConsoleError } from '@decipad/testutils';
import { MenuList } from './MenuList';
import { MenuItem, TriggerMenuItem } from '../../atoms';

mockConsoleError();

describe('the root MenuList', () => {
  describe('when open', () => {
    it('renders the menu items', () => {
      const { getByText, queryByText, rerender } = render(
        <MenuList root>
          <MenuItem>item</MenuItem>
        </MenuList>
      );
      expect(queryByText('item')).not.toBeInTheDocument();

      rerender(
        <MenuList root open>
          <MenuItem>item</MenuItem>
        </MenuList>
      );
      expect(getByText('item')).toBeInTheDocument();
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

  it('does not allow children other than MenuItems and MenuLists', () => {
    expect(() =>
      render(
        <MenuList root open>
          <div />
        </MenuList>
      )
    ).toThrow(/child/i);
  });
});

describe('the dropdown root MenuList', () => {
  it('emits changeOpen events when the trigger is clicked', () => {
    const handleChangeOpen = jest.fn();
    const { getByText } = render(
      <MenuList
        root
        dropdown
        trigger={<button>trigger</button>}
        onChangeOpen={handleChangeOpen}
      >
        {null}
      </MenuList>
    );
    userEvent.click(getByText('trigger'));
    expect(handleChangeOpen).toHaveBeenLastCalledWith(true);
  });

  describe('when open', () => {
    it('renders the menu items', () => {
      const { getByText, queryByText, rerender } = render(
        <MenuList root dropdown trigger={<button>trigger</button>}>
          <MenuItem>item</MenuItem>
        </MenuList>
      );
      expect(queryByText('item')).not.toBeInTheDocument();

      rerender(
        <MenuList root dropdown trigger={<button>trigger</button>} open>
          <MenuItem>item</MenuItem>
        </MenuList>
      );
      expect(getByText('item')).toBeInTheDocument();
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
    const { getByText } = render(
      <MenuList root open>
        <MenuList itemTrigger={<TriggerMenuItem>item</TriggerMenuItem>}>
          {null}
        </MenuList>
      </MenuList>
    );
    expect(getByText('item')).toBeInTheDocument();
  });

  it('renders its menu items only when open', () => {
    const { getByText, queryByText, rerender } = render(
      <MenuList root open>
        <MenuList itemTrigger={<TriggerMenuItem>item</TriggerMenuItem>}>
          <MenuItem>nested item</MenuItem>
        </MenuList>
      </MenuList>
    );
    expect(queryByText('nested item')).not.toBeInTheDocument();

    rerender(
      <MenuList root open>
        <MenuList itemTrigger={<TriggerMenuItem>item</TriggerMenuItem>} open>
          <MenuItem>nested item</MenuItem>
        </MenuList>
      </MenuList>
    );
    expect(getByText('nested item')).toBeInTheDocument();
  });

  it('can be uncontrolled', () => {
    const { getByText, queryByText } = render(
      <MenuList root open>
        <MenuList itemTrigger={<TriggerMenuItem>item</TriggerMenuItem>}>
          <MenuItem>nested item</MenuItem>
        </MenuList>
      </MenuList>
    );
    expect(queryByText('nested item')).not.toBeInTheDocument();

    userEvent.click(getByText('item'));
    expect(getByText('nested item')).toBeInTheDocument();
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
