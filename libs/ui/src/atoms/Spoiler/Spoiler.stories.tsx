import { Meta, StoryFn } from '@storybook/react';
import { Spoiler } from './Spoiler';

export default {
  title: 'Atoms / Editor / Text / Mark / Spoiler',
  component: Spoiler,
  args: {
    children: '~20% global adoption',
  },
  decorators: [
    (St) => (
      <div>
        Spreadsheets are more accessible with <St />, but they come with
        inherent problems. Have you ever used spreadsheets? Or, tried to read
        one? If you have, you know they are error-prone, quickly become too
        complex and were never designed for collaboration or knowledge sharing.
      </div>
    ),
  ],
} as Meta;

export const Normal: StoryFn<{ children: string }> = (args) => (
  <Spoiler {...args} />
);
