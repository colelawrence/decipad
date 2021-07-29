import { Meta, Story } from '@storybook/react';

import { Avatar } from './Avatar';

export default {
  title: 'Atoms / Avatar',
  component: Avatar,
  args: {
    name: 'John Doe',
    roundedSquare: false,
  },
} as Meta;

export const Initial: Story<{ name: string }> = (args) => <Avatar {...args} />;
