import { Meta, StoryFn } from '@storybook/react';
import { VerifyEmail } from './VerifyEmail';

const args = {
  email: 'foobar@decipad.com',
};

export default {
  title: 'Pages / Auth / Email Confirmation',
  component: VerifyEmail,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (props) => (
  <VerifyEmail {...props} />
);
