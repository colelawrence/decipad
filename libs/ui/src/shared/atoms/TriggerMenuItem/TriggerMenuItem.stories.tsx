import { Meta, StoryFn } from '@storybook/react';
// eslint-disable-next-line no-restricted-imports
import { MenuList } from '../../molecules';
import { circleIcon } from '../../../storybook-utils';
import { MenuItem } from '../index';
import { TriggerMenuItem, TriggerMenuItemProps } from './TriggerMenuItem';

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

export const TextOnly: StoryFn<Args> = (args: TriggerMenuItemProps) => (
  <MenuList root open>
    <MenuList itemTrigger={<TriggerMenuItem {...args} />}>
      <MenuItem {...args} />
    </MenuList>
  </MenuList>
);
export const Icon: StoryFn<Args> = (args: TriggerMenuItemProps) => (
  <MenuList root open>
    <MenuList itemTrigger={<TriggerMenuItem icon={circleIcon} {...args} />}>
      <MenuItem {...args} />
    </MenuList>
  </MenuList>
);
