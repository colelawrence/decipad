import { Meta, Story } from '@storybook/react';
import { Button } from './Button';

export default {
  title: 'Atoms / Button',
  component: Button,
  argTypes: {
    children: {
      control: { type: 'text', required: true },
      defaultValue: 'Text',
    },
  },
} as Meta;

export const PrimaryDefault: Story<{ children: string }> = (args) => (
  <Button primary {...args} />
);
export const PrimaryExtraSlim: Story<{ children: string }> = (args) => (
  <Button primary extraSlim {...args} />
);
