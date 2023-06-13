import { Meta, StoryFn } from '@storybook/react';
import { circleIcon, inMenu } from '../../storybook-utils';
import { MenuItem } from './MenuItem';

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

export const TextOnly: StoryFn<Args> = (args) => <MenuItem {...args} />;

export const Selected: StoryFn<Args> = (args) => (
  <MenuItem selected {...args} />
);

export const Icon: StoryFn<Args> = (args) => (
  <MenuItem icon={circleIcon} {...args} />
);

export const IconSelected: StoryFn<Args> = (args) => (
  <MenuItem icon={circleIcon} selected {...args} />
);
