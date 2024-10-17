import { Meta, StoryFn } from '@storybook/react';
import { circleIcon, inMenu } from '../../../storybook-utils';
import { MenuItem, MenuItemProps } from './MenuItem';

interface Args {
  children: string;
}

export default {
  title: 'Atoms / UI / Menu / Item',
  component: MenuItem,
  args: {
    children: 'Text',
  },
  decorators: [inMenu],
} as Meta<Args>;

export const TextOnly: StoryFn<Args> = (args: MenuItemProps) => (
  <MenuItem {...args} />
);

export const Selected: StoryFn<Args> = (args: MenuItemProps) => (
  <MenuItem selected {...args} />
);

export const Icon: StoryFn<Args> = (args: MenuItemProps) => (
  <MenuItem icon={circleIcon} {...args} />
);

export const IconSelected: StoryFn<Args> = (args: MenuItemProps) => (
  <MenuItem icon={circleIcon} selected {...args} />
);
