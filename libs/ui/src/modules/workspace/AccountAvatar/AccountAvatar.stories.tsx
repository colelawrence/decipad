import { Meta, StoryFn } from '@storybook/react';
import { AccountAvatar, AccountAvatarProps } from './AccountAvatar';

export default {
  title: 'Molecules /  UI / Avatar',
  component: AccountAvatar,
  args: {
    menuOpen: false,
  },
} as Meta;

export const Normal: StoryFn<{ menuOpen: boolean }> = ({
  menuOpen,
}: AccountAvatarProps) => <AccountAvatar name="John Doe" menuOpen={menuOpen} />;
