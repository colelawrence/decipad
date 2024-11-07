import { Meta } from '@storybook/react';
import { Avatar, AvatarProps } from './Avatar';

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

export const Initial = (props: AvatarProps) => <Avatar {...props} />;
