import React from 'react';
import { HeaderTwo } from './HeaderTwo.component';

export default {
  title: 'Editor/Basic Elements/Headers/Header Two',
};

export const Two = () => (
  <HeaderTwo
    element={{ children: [{ text: 'hello world ' }] }}
    attributes={{
      'data-slate-node': 'element',
      ref: null,
    }}
  >
    The quick brown fox jumps over the lazy dog
  </HeaderTwo>
);

Two.storyName = 'Header Two';
