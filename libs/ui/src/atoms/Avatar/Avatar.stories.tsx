import { Meta, Story } from '@storybook/react';

import { Avatar } from './Avatar';

export default {
  title: 'Atoms / Avatar',
  component: Avatar,
  args: {
    userName: 'John Doe',
    roundedSquare: false,
  },
} as Meta;

export const Initial: Story<{ userName: string }> = (args) => (
  <Avatar {...args} />
);
