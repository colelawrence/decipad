import { Meta, StoryFn } from '@storybook/react';
import { AccountMenu, AccountMenuProps } from './AccountMenu';

export default {
  title: 'Organisms / UI / Account / Menu',
  component: AccountMenu,
  args: {
    name: 'John Doe',
    email: 'john.doe@example.com',
  },
} as Meta<AccountMenuProps>;

export const Normal: StoryFn<AccountMenuProps> = (args) => (
  <AccountMenu {...args} />
);
