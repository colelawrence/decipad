import { Meta, StoryFn } from '@storybook/react';
import { Checkbox, CheckboxProps } from './Checkbox';

export default {
  title: 'Atoms / UI / Checkbox',
  component: Checkbox,
  args: {
    checked: false,
    size: 16,
  },
} as Meta;

export const Normal: StoryFn<CheckboxProps> = (args) => <Checkbox {...args} />;
