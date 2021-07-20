import React from 'react';
import { ModelBlock } from './ModelBlock.component';

export default {
  title: 'Editor/Blocks/Model Block',
  component: ModelBlock,
};

export const Default = (args: { text: string }) => (
  <ModelBlock
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
  </ModelBlock>
);

Default.args = {
  text: 'a = 10 apples',
};

Default.storyName = 'Model Block';
