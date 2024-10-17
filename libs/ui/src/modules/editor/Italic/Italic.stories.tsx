import { Meta, StoryFn } from '@storybook/react';
import { Italic, ItalicProps } from './Italic';

export default {
  title: 'Atoms / Editor / Text / Mark / Italic',
  component: Italic,
  args: {
    children: 'Just start writing',
  },
  decorators: [
    (St: StoryFn) => (
      <div>
        You can quickly create data-driven documents with greater readability
        and understanding. <St />.
      </div>
    ),
  ],
} as Meta;

export const Normal: StoryFn<{ children: string }> = (args: ItalicProps) => (
  <Italic {...args} />
);
