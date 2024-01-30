import { Meta, StoryFn } from '@storybook/react';
import { Bold } from './Bold';

export default {
  title: 'Atoms / Editor / Text / Mark / Bold',
  component: Bold,
  args: {
    children: 'bold',
  },
  decorators: [
    (St) => (
      <div>
        This is <St /> text.
      </div>
    ),
  ],
} as Meta;

export const Normal: StoryFn<{ children: string }> = (args) => (
  <Bold {...args} />
);
