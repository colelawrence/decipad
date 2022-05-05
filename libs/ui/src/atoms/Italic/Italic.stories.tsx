import { Meta, Story } from '@storybook/react';
import { Italic } from './Italic';

export default {
  title: 'Atoms / Editor / Text / Mark / Italic',
  component: Italic,
  args: {
    children: 'Just start writing',
  },
  decorators: [
    (St) => (
      <div>
        You can quickly create data-driven documents with greater readability
        and understanding. <St />.
      </div>
    ),
  ],
} as Meta;

export const Normal: Story<{ children: string }> = (args) => (
  <Italic {...args} />
);
