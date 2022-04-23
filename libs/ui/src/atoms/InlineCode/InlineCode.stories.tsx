import { Meta, Story } from '@storybook/react';
import { InlineCode } from './InlineCode';

export default {
  title: 'Atoms / Editor / Text / Inline / Code',
  component: InlineCode,
  args: {
    children: 'Text',
  },
} as Meta;

export const Normal: Story<{ children: string }> = (args) => (
  <InlineCode {...args} />
);
