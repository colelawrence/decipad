import { Meta, Story } from '@storybook/react';
import { Strikethrough } from './Strikethrough';

export default {
  title: 'Atoms / Editor / Text / Mark / Strikethrough',
  component: Strikethrough,
  args: {
    children: 'Excel',
  },
  decorators: [
    (St) => (
      <div>
        “I am most excited about the role <St /> Decipad is playing in the
        future of work,” says Avi Eyal, Managing Partner at Entrée Capital.
      </div>
    ),
  ],
} as Meta;

export const Normal: Story<{ children: string }> = (args) => (
  <Strikethrough {...args} />
);
