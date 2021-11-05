import { Meta, Story } from '@storybook/react';
import { cssVar } from '../../primitives';
import { MenuItem, TriggerMenuItem } from '../../atoms';
import { MenuList } from './MenuList';

export default {
  title: 'Molecules / Menu List',
  component: MenuList,
} as Meta;

const icon = (
  <svg viewBox="0 0 1 1">
    <circle cx="50%" cy="50%" r="50%" fill={cssVar('currentTextColor')} />
  </svg>
);

export const Normal: Story = () => {
  return (
    <MenuList trigger={<button>Click me</button>}>
      <MenuItem icon={icon}>Item 1</MenuItem>
      <MenuList trigger={<TriggerMenuItem icon={icon}>Item 2</TriggerMenuItem>}>
        <MenuItem icon={icon}>Item 2.1</MenuItem>
        <MenuItem icon={icon}>Item 2.2</MenuItem>
      </MenuList>
    </MenuList>
  );
};
