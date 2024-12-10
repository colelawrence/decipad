import { Meta, StoryFn } from '@storybook/react';
import { InputFieldDate, InputFieldDateProps } from './InputFieldDate';

const args: InputFieldDateProps = {
  value: '2024-12-05',
  onChange: (newValue) => console.info(newValue),
};

export default {
  title: 'Atoms / UI / Input Field Date',
  component: InputFieldDate,
  args,
} as Meta<InputFieldDateProps>;

export const Normal: StoryFn<typeof args> = (props: InputFieldDateProps) => (
  <InputFieldDate {...props} />
);
