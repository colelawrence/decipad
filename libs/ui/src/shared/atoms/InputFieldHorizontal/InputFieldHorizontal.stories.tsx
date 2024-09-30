import { Meta, StoryFn } from '@storybook/react';
import {
  InputFieldHorizontal,
  InputFieldHorizontalGroup,
  InputFieldHorizontalProps,
} from './InputFieldHorizontal';

const args: InputFieldHorizontalProps = {
  label: 'My field',
  placeholder: 'Placeholder',
  value: 'Input Value',
};

export default {
  title: 'Atoms / UI / Input Field Horizontal',
  component: InputFieldHorizontal,
  args,
} as Meta<InputFieldHorizontalProps>;

export const Normal: StoryFn<typeof args> = (props) => (
  <InputFieldHorizontalGroup>
    <InputFieldHorizontal {...props} />
  </InputFieldHorizontalGroup>
);
