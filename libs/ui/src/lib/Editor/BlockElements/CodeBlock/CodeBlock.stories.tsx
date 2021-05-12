import React from 'react';
import { CodeBlock } from './CodeBlock.component';

export default {
  title: 'Editor/Block Elements/CodeBlock',
};

export const C = () => (
  <CodeBlock
    element={{ children: [{ text: 'hello world ' }] }}
    attributes={{
      'data-slate-node': 'element',
      ref: null,
    }}
  >
    The quick brown fox jumps over the lazy dog
  </CodeBlock>
);

C.storyName = 'CodeBlock';
