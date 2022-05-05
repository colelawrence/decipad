import { Meta, Story } from '@storybook/react';
import { Display } from './Display';

export default {
  title: 'Atoms / Editor / Text / Title',
  component: Display,
} as Meta;

export const Normal: Story<{ children: string }> = (args) => (
  <Display Heading="h1" {...args} />
);
Normal.args = {
  children:
    'Meet Decipad. We want to change the world’s relationship with numbers',
};

export const Placeholder: Story<{ placeholder: string }> = (args) => (
  <Display Heading="h1" {...args}>
    {null}
  </Display>
);
Placeholder.args = { placeholder: 'My notebook title' };
