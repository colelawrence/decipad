import { Meta, Story } from '@storybook/react';
import { Underline } from './Underline';

export default {
  title: 'Atoms / Editor / Text / Inline / Underline',
  component: Underline,
  args: {
    children: 'Text',
  },
} as Meta;

export const Normal: Story<{ children: string }> = (args) => (
  <Underline {...args} />
);
