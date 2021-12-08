import { Meta, Story } from '@storybook/react';
import { Strikethrough } from './Strikethrough';

export default {
  title: 'Atoms / Editor / Text / Inline / Strikethrough',
  component: Strikethrough,
  args: {
    children: 'Text',
  },
} as Meta;

export const Normal: Story<{ children: string }> = (args) => (
  <Strikethrough {...args} />
);
