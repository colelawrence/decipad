import { Meta, Story } from '@storybook/react';
import { Italic } from './Italic';

export default {
  title: 'Atoms / Editor / Text / Inline / Italic',
  component: Italic,
  args: {
    children: 'Text',
  },
} as Meta;

export const Normal: Story<{ children: string }> = (args) => (
  <Italic {...args} />
);
