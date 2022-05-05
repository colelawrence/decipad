import { Meta, Story } from '@storybook/react';
import { InputField, InputFieldProps } from './InputField';

const args: InputFieldProps = {
  placeholder: 'Placeholder',
  value: 'Input Value',
};

export default {
  title: 'Atoms / UI / Input Field',
  component: InputField,
  args,
} as Meta<InputFieldProps>;

export const Normal: Story<typeof args> = (props) => <InputField {...props} />;
