import { Meta, Story } from '@storybook/react';
import { Blockquote } from './Blockquote';

export default {
  title: 'Atoms / Editor / Text / Blockquote',
  component: Blockquote,
} as Meta;

export const Normal: Story<{ children: string }> = (args) => (
  <Blockquote {...args} />
);
Normal.args = { children: 'Text' };
