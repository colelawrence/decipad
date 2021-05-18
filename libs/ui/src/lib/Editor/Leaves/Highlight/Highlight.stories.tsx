import React from 'react';
import { Highlight } from './Highlight.component';

export default {
  title: 'Editor/Leaves/Highlight',
};

export const B = () => (
  <Highlight
    text={{ text: 'hello world' }}
    leaf={{ text: 'hello world' }}
    attributes={{
      'data-slate-leaf': true,
    }}
  >
    The quick brown fox jumps over the lazy dog
  </Highlight>
);

B.storyName = 'Highlight';
