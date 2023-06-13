import { Meta, StoryFn } from '@storybook/react';
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
} as Meta;

export const Initial: StoryFn<typeof args> = (props) => <Avatar {...props} />;
