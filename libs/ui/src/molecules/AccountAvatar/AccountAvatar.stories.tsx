import { Meta, Story } from '@storybook/react';
import { AccountAvatar } from './AccountAvatar';

export default {
  title: 'Molecules / Account Avatar',
  component: AccountAvatar,
  args: {
    menuOpen: false,
  },
} as Meta;

export const Normal: Story<{ menuOpen: boolean }> = ({ menuOpen }) => (
  <AccountAvatar userName="John Doe" menuOpen={menuOpen} />
);
