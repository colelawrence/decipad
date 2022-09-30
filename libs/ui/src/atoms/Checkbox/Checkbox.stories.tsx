import { Meta, Story } from '@storybook/react';
import { Checkbox, CheckboxProps } from './Checkbox';

export default {
  title: 'Atoms / UI / Checkbox',
  component: Checkbox,
  args: {
    checked: false,
    size: 16,
  },
} as Meta;

export const Normal: Story<CheckboxProps> = (args) => <Checkbox {...args} />;
