import { Meta, Story } from '@storybook/react';
import { Highlight } from './Highlight';

export default {
  title: 'Atoms / Editor / Text / Inline / Highlight',
  component: Highlight,
  args: {
    children: 'Text',
  },
} as Meta;

export const Normal: Story<{ children: string }> = (args) => (
  <Highlight {...args} />
);
