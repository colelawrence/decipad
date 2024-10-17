import { Meta, StoryFn } from '@storybook/react';
import { VerifyEmail, VerifyEmailProps } from './VerifyEmail';

const args = {
  email: 'foobar@decipad.com',
};

export default {
  title: 'Pages / Auth / Email Confirmation',
  component: VerifyEmail,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (props: VerifyEmailProps) => (
  <VerifyEmail {...props} />
);
