import React from 'react';
import { HeaderThree } from './HeaderThree.component';

export default {
  title: 'Editor/Basic Elements/Headers/Header Three',
};

export const Three = () => (
  <HeaderThree
    element={null}
    attributes={{
      'data-slate-node': 'element',
      ref: null,
    }}
  >
    The quick brown fox jumps over the lazy dog
  </HeaderThree>
);

Three.storyName = 'Header Three';
