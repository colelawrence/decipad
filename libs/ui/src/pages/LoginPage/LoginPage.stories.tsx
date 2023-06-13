import { Meta, StoryFn } from '@storybook/react';
import { LoginPage, LoginPageProps } from './LoginPage';

export default {
  title: 'Pages / Auth / Login',
  component: LoginPage,
  argTypes: {
    onSubmit: {
      action: 'submitted',
    },
  },
} as Meta;

export const Normal: StoryFn<LoginPageProps> = (args) => (
  <LoginPage {...args} />
);
