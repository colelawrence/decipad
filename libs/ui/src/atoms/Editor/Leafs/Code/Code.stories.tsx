import { Meta, Story } from '@storybook/react';
import { CodeLeaf } from './Code';

export default {
  title: 'Legacy/Editor/Leafs/Code',
  component: CodeLeaf,
  args: {
    text: '10 apples',
  },
} as Meta;

export const Code: Story<{ text: string }> = (args) => (
  <CodeLeaf
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
  </CodeLeaf>
);
