import { Meta, Story } from '@storybook/react';
import { Avatar } from './Avatar';

const args = {
  name: 'John Doe',
  roundedSquare: false,
  greyedOut: false,
};
export default {
  title: 'Atoms / UI / Avatar',
  component: Avatar,
  args,
  parameters: {
    chromatic: { disable: true },
  },
} as Meta;

export const Initial: Story<typeof args> = (props) => <Avatar {...props} />;
