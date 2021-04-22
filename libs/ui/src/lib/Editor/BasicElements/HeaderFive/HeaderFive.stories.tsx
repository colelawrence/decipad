import React from 'react';
import { HeaderFive } from './HeaderFive.component';

export default {
  title: 'Editor/Basic Elements/Headers/Header Five',
};

export const Five = () => (
  <HeaderFive
    element={null}
    attributes={{
      'data-slate-node': 'element',
      ref: null,
    }}
  >
    The quick brown fox jumps over the lazy dog
  </HeaderFive>
);

Five.storyName = 'Header Five';
