import { Meta, StoryFn } from '@storybook/react';
import {
  InputFieldTextArea,
  InputFieldTextAreaProps,
} from './InputFieldTextArea';

const args: InputFieldTextAreaProps = {
  placeholder: 'Placeholder',
  value: 'Input Value',
};

export default {
  title: 'Atoms / UI / Input Field Text Area',
  component: InputFieldTextArea,
  args,
} as Meta<InputFieldTextAreaProps>;

export const Normal: StoryFn<typeof args> = (
  props: InputFieldTextAreaProps
) => <InputFieldTextArea {...props} />;
