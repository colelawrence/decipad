import { Meta, Story } from '@storybook/react';
import { AccountMenu, AccountMenuProps } from './AccountMenu';

export default {
  title: 'Organisms / Account / Menu',
  component: AccountMenu,
  args: {
    userName: 'John Doe',
    email: 'john.doe@example.com',
  },
} as Meta<AccountMenuProps>;

export const Normal: Story<AccountMenuProps> = (args) => (
  <AccountMenu {...args} />
);
