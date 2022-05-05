import { Meta, Story } from '@storybook/react';
import { AuthContent, AuthContentProps } from './AuthContent';

const args: AuthContentProps = {
  title: 'Auth Content Title',
  description: 'So here is the description of the auth content molecule',
};

export default {
  title: 'Molecules / UI / Auth / Pane',
  component: AuthContent,
  args,
} as Meta<AuthContentProps>;

export const Normal: Story<typeof args> = (props) => <AuthContent {...props} />;
