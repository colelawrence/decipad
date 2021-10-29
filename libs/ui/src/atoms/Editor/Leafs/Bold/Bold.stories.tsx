import { Meta, Story } from '@storybook/react';
import { BoldLeaf } from './Bold';

export default {
  title: 'Legacy/Editor/Leafs/Bold',
  component: BoldLeaf,
  children: {
    text: 'Bold text',
  },
} as Meta;

export const Bold: Story<{ text: string }> = (args) => (
  <BoldLeaf
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
  </BoldLeaf>
);
