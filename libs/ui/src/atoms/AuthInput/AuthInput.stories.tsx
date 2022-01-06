import { Meta, Story } from '@storybook/react';
import { AuthInput, AuthInputProps } from './AuthInput';

const args: AuthInputProps = {
  placeholder: 'Placeholder',
};

export default {
  title: 'Atoms / Auth / Input',
  component: AuthInput,
  args,
} as Meta<AuthInputProps>;

export const Normal: Story<typeof args> = (props) => <AuthInput {...props} />;
