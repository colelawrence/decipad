import { Meta, Story } from '@storybook/react';
import { VerifyEmail } from './VerifyEmail';

export default {
  title: 'Pages / Auth / Email Confirmation',
  component: VerifyEmail,
  parameters: {
    chromatic: { viewports: [320, 1280] },
  },
} as Meta;

export const Normal: Story = () => <VerifyEmail />;
