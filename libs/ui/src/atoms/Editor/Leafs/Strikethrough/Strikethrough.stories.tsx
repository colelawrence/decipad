import { Meta, Story } from '@storybook/react';
import { StrikethroughLeaf } from './Strikethrough';

export default {
  title: 'Legacy/Editor/Leafs/Strikethrough',
  component: StrikethroughLeaf,
  args: {
    text: 'This text is crossed out',
  },
} as Meta;

export const Strikethrough: Story<{ text: string }> = (args) => (
  <StrikethroughLeaf
    leaf={{ attributes: {}, text: '' }}
    element={{ children: [{ text: '' }] }}
    text={{ text: '' }}
    attributes={{
      'data-slate-node': 'element',
      ref: null,
      'data-slate-leaf': true,
    }}
  >
    {args.text}
  </StrikethroughLeaf>
);
