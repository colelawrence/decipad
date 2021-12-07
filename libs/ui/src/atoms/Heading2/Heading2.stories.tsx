import { Meta, Story } from '@storybook/react';
import { Heading2 } from './Heading2';

export default {
  title: 'Atoms / Editor / Text / Heading 2',
  component: Heading2,
} as Meta;

export const Normal: Story<{ children: string }> = (args) => (
  <Heading2 Heading="h3" {...args} />
);
Normal.args = { children: 'Text' };
