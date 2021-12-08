import { Meta, Story } from '@storybook/react';
import { Code } from './Code';

export default {
  title: 'Atoms / Editor / Text / Inline / Code',
  component: Code,
  args: {
    children: 'Text',
  },
} as Meta;

export const Normal: Story<{ children: string }> = (args) => <Code {...args} />;
