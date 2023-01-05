import { Meta, Story } from '@storybook/react';
import { AccountSetupFlow1 } from './AccountSetupFlow1';

export default {
  title: 'Pages / Account / Setup / Screen 1',
  component: AccountSetupFlow1,
} as Meta;

export const Normal: Story = () => <AccountSetupFlow1 />;
