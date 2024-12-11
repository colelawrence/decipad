import { noop } from '@decipad/utils';
import { Meta, StoryFn } from '@storybook/react';
import { DropdownMenu, DropdownMenuProps } from './DropdownMenu';

const args: Omit<DropdownMenuProps, 'children'> = {
  onExecute: noop,
  open: true,
  setOpen: noop,
  isReadOnly: false,
  items: [
    {
      id: '1',
      item: 'Hello',
    },
    {
      id: '2',
      item: 'World',
    },
  ],
};

export default {
  title: 'Organisms / Editor / Widgets / Dropdown',
  component: DropdownMenu,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (props: DropdownMenuProps) => (
  <DropdownMenu {...props}>
    <></>
  </DropdownMenu>
);
