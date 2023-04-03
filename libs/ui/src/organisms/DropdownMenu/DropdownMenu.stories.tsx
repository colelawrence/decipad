import { noop } from '@decipad/utils';
import { Meta, Story } from '@storybook/react';
import { DropdownMenu, DropdownMenuProps } from './DropdownMenu';

const args: Omit<DropdownMenuProps, 'children'> = {
  onExecute: noop,
  open: true,
  setOpen: noop,
  isReadOnly: false,
  groups: [
    {
      item: 'Hello',
      index: 0,
    },
    {
      item: 'World',
      index: 1,
    },
  ],
};

export default {
  title: 'Organisms / Editor / Widgets / Dropdown',
  component: DropdownMenu,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <DropdownMenu {...props}>
    <></>
  </DropdownMenu>
);
