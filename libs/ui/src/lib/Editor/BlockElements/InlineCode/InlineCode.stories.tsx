import React from 'react';
import { InlineCode } from './InlineCode.component';

export default {
  title: 'Editor/Block Elements/InlineCode',
};

export const C = () => (
  <InlineCode
    element={null}
    attributes={{
      'data-slate-node': 'element',
      ref: null,
    }}
  >
    The quick brown fox jumps over the lazy dog
  </InlineCode>
);

C.storyName = 'InlineCode';
