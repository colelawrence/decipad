import { Meta, Story } from '@storybook/react';
import { MenuList } from '../../molecules';
import { circleIcon } from '../../storybook-utils';
import { MenuItem } from '../index';
import { TriggerMenuItem } from './TriggerMenuItem';

interface Args {
  children: string;
}

export default {
  title: 'Atoms / UI / Menu / Trigger Item',
  component: TriggerMenuItem,
  args: {
    children: 'Text',
  },
} as Meta<Args>;

export const TextOnly: Story<Args> = (args) => (
  <MenuList root open>
    <MenuList itemTrigger={<TriggerMenuItem {...args} />}>
      <MenuItem {...args} />
    </MenuList>
  </MenuList>
);
export const Icon: Story<Args> = (args) => (
  <MenuList root open>
    <MenuList itemTrigger={<TriggerMenuItem icon={circleIcon} {...args} />}>
      <MenuItem {...args} />
    </MenuList>
  </MenuList>
);
