import { BlockIsActiveProvider } from '@decipad/react-contexts';
import { Meta, Story } from '@storybook/react';
import { Blockquote } from './Blockquote';

const args = { children: 'Text' };

export default {
  title: 'Atoms / Editor / Text / Blockquote',
  component: Blockquote,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => <Blockquote {...props} />;

export const Active: Story<typeof args> = (props) => (
  <BlockIsActiveProvider>
    <Blockquote {...props} />
  </BlockIsActiveProvider>
);
