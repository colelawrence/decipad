import { Meta, Story } from '@storybook/react';
import { VerifyEmail } from './VerifyEmail';

export default {
  title: 'Pages / Auth / Email Confirmation',
  component: VerifyEmail,
} as Meta;

export const Normal: Story = () => <VerifyEmail />;
