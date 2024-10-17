import { Meta, StoryFn } from '@storybook/react';
import { InlineCode, InlineCodeProps } from './InlineCode';

export default {
  title: 'Atoms / Editor / Text / Mark / Code',
  component: InlineCode,
  args: {
    children: 'Decipad',
  },
  decorators: [
    (St: StoryFn) => (
      <div>
        Today, when you enter <St /> you can create a notebook and just start
        writing with text, data, and numbers together.
      </div>
    ),
  ],
} as Meta;

export const Normal: StoryFn<{ children: string }> = (
  args: InlineCodeProps
) => <InlineCode {...args} />;
