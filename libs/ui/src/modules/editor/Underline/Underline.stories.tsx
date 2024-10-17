import { Meta, StoryFn } from '@storybook/react';
import { Underline, UnderlineProps } from './Underline';

export default {
  title: 'Atoms / Editor / Text / Mark / Underline',
  component: Underline,
  args: {
    children: 'there will be 175 zettabytes of data',
  },
  decorators: [
    (St: StoryFn) => (
      <div>
        Today, people and businesses have access to more data and information
        than ever before. By 2025, <St />.
      </div>
    ),
  ],
} as Meta;

export const Normal: StoryFn<{ children: string }> = (args: UnderlineProps) => (
  <Underline {...args} />
);
