import { Meta, Story } from '@storybook/react';
import { AuthContent, AuthContentProps } from './AuthContent';

export default {
  title: 'Molecules / Auth / Content',
  component: AuthContent,
  args: {
    title: 'Auth Content Title',
    description: 'So here is the description of the auth content molecule',
  },
} as Meta<AuthContentProps>;

export const Normal: Story<AuthContentProps> = ({ title, description }) => (
  <AuthContent title={title} description={description} />
);
