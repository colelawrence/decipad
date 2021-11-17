import { Meta, Story } from '@storybook/react';

import { Avatar } from './Avatar';

const args = {
  name: 'John Doe',
  roundedSquare: false,
  greyedOut: false,
};
export default {
  title: 'Atoms / Avatar',
  component: Avatar,
  args,
} as Meta;

export const Initial: Story<typeof args> = (props) => <Avatar {...props} />;
