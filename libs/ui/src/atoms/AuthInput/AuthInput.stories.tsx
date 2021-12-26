import { Meta, Story } from '@storybook/react';
import { AuthInput, AuthInputProps } from './AuthInput';

export default {
  title: 'Atoms / Auth / Input',
  component: AuthInput,
  args: {
    placeholder: 'Placeholder',
  },
} as Meta<AuthInputProps>;

export const Normal: Story<AuthInputProps> = (args) => <AuthInput {...args} />;
