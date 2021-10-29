import { Meta, Story } from '@storybook/react';
import { UnderlineLeaf } from './Underline';

export default {
  title: 'Legacy/Editor/Leafs/Underline',
  component: UnderlineLeaf,
  args: {
    text: 'Underlined text',
  },
} as Meta;

export const Underline: Story<{ text: string }> = (args) => (
  <UnderlineLeaf
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
  </UnderlineLeaf>
);
