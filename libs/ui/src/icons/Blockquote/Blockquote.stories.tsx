import { Meta, Story } from '@storybook/react';
import { Blockquote } from './Blockquote';

export default {
  title: 'Icons / Blockquote',
  component: Blockquote,
} as Meta;

export const Normal: Story = () => <Blockquote />;
