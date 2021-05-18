import React from 'react';
import { HeaderOne } from './HeaderOne.component';

export default {
  title: 'Editor/Basic Elements/Headers/Header One',
};

export const One = () => (
  <HeaderOne
    element={{ children: [{ text: 'hello world ' }] }}
    attributes={{
      'data-slate-node': 'element',
      ref: null,
    }}
  >
    The quick brown fox jumps over the lazy dog
  </HeaderOne>
);

One.storyName = 'Header One';
