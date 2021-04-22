import React from 'react';
import { Blockquote } from './Blockquote.component';

export default {
  title: 'Editor/Block Elements/Blockquote',
};

export const B = () => (
  <Blockquote
    element={null}
    attributes={{
      'data-slate-node': 'element',
      ref: null,
    }}
  >
    The quick brown fox jumps over the lazy dog
  </Blockquote>
);

B.storyName = 'Blockquote';
