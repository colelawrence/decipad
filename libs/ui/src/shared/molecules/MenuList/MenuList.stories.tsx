import { Meta, StoryFn } from '@storybook/react';
import { MenuItem, TriggerMenuItem } from '../../atoms';
import { circleIcon } from '../../../storybook-utils';
import {
  MenuList,
  DropdownRootMenuListProps,
  RootMenuListProps,
} from './MenuList';

const args = { open: true };

export default {
  title: 'Molecules / UI / Menu List',
  component: MenuList,
  args,
} as Meta;

const children = [
  <MenuItem icon={circleIcon}>Item 1</MenuItem>,
  <MenuList
    itemTrigger={<TriggerMenuItem icon={circleIcon}>Item 2</TriggerMenuItem>}
  >
    <MenuItem icon={circleIcon}>Item 2.1</MenuItem>
    <MenuItem icon={circleIcon}>Item 2.2</MenuItem>
  </MenuList>,
  <MenuList
    itemTrigger={<TriggerMenuItem icon={circleIcon}>Item 3</TriggerMenuItem>}
  >
    <MenuItem icon={circleIcon}>Item 3.1</MenuItem>
    <MenuItem icon={circleIcon}>Item 3.2</MenuItem>
  </MenuList>,
];

export const Normal: StoryFn<typeof args> = (props: RootMenuListProps) => {
  return (
    <MenuList {...props} root>
      {children}
    </MenuList>
  );
};
export const Dropdown: StoryFn<typeof args> = (
  props: DropdownRootMenuListProps
) => {
  return (
    <MenuList {...props} root dropdown trigger={<button>anchor</button>}>
      {children}
    </MenuList>
  );
};
