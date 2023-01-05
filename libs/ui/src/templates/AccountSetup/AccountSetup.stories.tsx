import { Meta, Story } from '@storybook/react';
import { AccountSetup } from './AccountSetup';

export default {
  title: 'Templates / Account / Setup',
  component: AccountSetup,
} as Meta;

export const Normal: Story = () => (
  <AccountSetup left={'Left Side'} right={'Right Side'} />
);
