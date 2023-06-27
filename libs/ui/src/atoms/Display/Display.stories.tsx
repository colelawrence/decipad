import { Meta, StoryFn } from '@storybook/react';
import { Display } from './Display';

export default {
  title: 'Atoms / Editor / Text / Title',
  component: Display,
} as Meta;

export const Normal: StoryFn<{ children: string }> = (args) => (
  <Display Heading="h1" {...args} />
);
Normal.args = {
  children:
    'Meet Decipad. We want to change the world’s relationship with numbers',
};

export const Placeholder: StoryFn<{ placeholder: string }> = (args) => (
  <Display Heading="h1" {...args}>
    {null}
  </Display>
);
Placeholder.args = { placeholder: 'My notebook' };
