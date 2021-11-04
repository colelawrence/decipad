import { Meta, Story } from '@storybook/react';
import { MenuList } from '../../molecules';
import { circleIcon } from '../../storybook-utils';
import { MenuItem } from '../index';
import { TriggerMenuItem } from './TriggerMenuItem';

interface Args {
  children: string;
}

export default {
  title: 'Atoms / Trigger Menu Item',
  component: TriggerMenuItem,
  args: {
    children: 'Text',
  },
} as Meta<Args>;

export const TextOnly: Story<Args> = (args) => (
  <MenuList defaultOpen trigger={<span></span>}>
    <MenuList trigger={<TriggerMenuItem {...args} />}>
      <MenuItem {...args} />
    </MenuList>
  </MenuList>
);
export const Icon: Story<Args> = (args) => (
  <MenuList defaultOpen trigger={<span></span>}>
    <MenuList trigger={<TriggerMenuItem icon={circleIcon} {...args} />}>
      <MenuItem {...args} />
    </MenuList>
  </MenuList>
);
