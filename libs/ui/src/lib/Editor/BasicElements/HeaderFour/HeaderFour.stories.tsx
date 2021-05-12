import React from 'react';
import { HeaderFour } from './HeaderFour.component';

export default {
  title: 'Editor/Basic Elements/Headers/Header Four',
};

export const Four = () => (
  <HeaderFour
    element={{ children: [{ text: 'hello world ' }] }}
    attributes={{
      'data-slate-node': 'element',
      ref: null,
    }}
  >
    The quick brown fox jumps over the lazy dog
  </HeaderFour>
);

Four.storyName = 'Header Four';
