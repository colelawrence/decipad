import { Meta, Story } from '@storybook/react';
import { Heading1 } from './Heading1';

export default {
  title: 'Atoms / Editor / Text / Heading 1',
  component: Heading1,
} as Meta;

export const Normal: Story<{ children: string }> = (args) => (
  <Heading1 Heading="h2" {...args} />
);
Normal.args = { children: 'Text' };
