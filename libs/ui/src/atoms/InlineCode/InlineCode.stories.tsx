import { Meta, Story } from '@storybook/react';
import { InlineCode } from './InlineCode';

export default {
  title: 'Atoms / Editor / Text / Mark / Code',
  component: InlineCode,
  args: {
    children: 'Decipad',
  },
  decorators: [
    (St) => (
      <div>
        Today, when you enter <St /> you can create a notebook and just start
        writing with text, data, and numbers together.
      </div>
    ),
  ],
} as Meta;

export const Normal: Story<{ children: string }> = (args) => (
  <InlineCode {...args} />
);
