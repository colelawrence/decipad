import { Meta, Story } from '@storybook/react';
import { MenuItem, TriggerMenuItem } from '../../atoms';
import { MenuList } from './MenuList';
import { circleIcon } from '../../storybook-utils';

export default {
  title: 'Molecules / Menu List',
  component: MenuList,
} as Meta;

export const Normal: Story = () => {
  return (
    <MenuList trigger={<button>Click me</button>}>
      <MenuItem icon={circleIcon}>Item 1</MenuItem>
      <MenuList
        trigger={<TriggerMenuItem icon={circleIcon}>Item 2</TriggerMenuItem>}
      >
        <MenuItem icon={circleIcon}>Item 2.1</MenuItem>
        <MenuItem icon={circleIcon}>Item 2.2</MenuItem>
      </MenuList>
    </MenuList>
  );
};
