import React from 'react';
import { HeaderSix } from './HeaderSix.component';

export default {
  title: 'Editor/Basic Elements/Headers/Header Six',
};

export const Six = () => (
  <HeaderSix
    element={{ children: [{ text: 'hello world ' }] }}
    attributes={{
      'data-slate-node': 'element',
      ref: null,
    }}
  >
    The quick brown fox jumps over the lazy dog
  </HeaderSix>
);

Six.storyName = 'Header Six';
