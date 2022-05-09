import { Meta, Story } from '@storybook/react';
import { LoginPage, LoginPageProps } from './LoginPage';

export default {
  title: 'Pages / Auth / Login',
  component: LoginPage,
  argTypes: {
    onSubmit: {
      action: 'submitted',
    },
  },
  parameters: {
    chromatic: { viewports: [320, 1280] },
  },
} as Meta;

export const Normal: Story<LoginPageProps> = (args) => <LoginPage {...args} />;
