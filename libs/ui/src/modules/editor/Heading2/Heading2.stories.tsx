import { Meta, StoryFn } from '@storybook/react';
import { Heading2, Heading2Props } from './Heading2';

const args = { children: 'Why isn’t data analysis more mainstream?' };

export default {
  title: 'Atoms / Editor / Text / Block / Heading 2',
  component: Heading2,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (props: Heading2Props) => (
  <Heading2 {...props} />
);

export const Active: StoryFn<typeof args> = (props: Heading2Props) => (
  <Heading2 {...props} />
);
