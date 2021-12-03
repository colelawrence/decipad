import { Meta, Story } from '@storybook/react';
import { circleIcon, inMenu } from '../../storybook-utils';
import { MenuItem } from './MenuItem';

interface Args {
  children: string;
}

export default {
  title: 'Atoms / Menu Item',
  component: MenuItem,
  args: {
    children: 'Text',
  },
  decorators: [inMenu],
} as Meta<Args>;

export const TextOnly: Story<Args> = (args) => <MenuItem {...args} />;

export const Selected: Story<Args> = (args) => <MenuItem selected {...args} />;

export const Icon: Story<Args> = (args) => (
  <MenuItem icon={circleIcon} {...args} />
);

export const IconSelected: Story<Args> = (args) => (
  <MenuItem icon={circleIcon} selected {...args} />
);
