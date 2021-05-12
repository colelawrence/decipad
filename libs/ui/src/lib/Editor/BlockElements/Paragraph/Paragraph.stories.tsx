import React from 'react';
import { Paragraph } from './Paragraph.component';

export default {
  title: 'Editor/Block Elements/Paragraph',
};

export const P = () => (
  <Paragraph
    element={{ children: [{ text: 'hello world ' }] }}
    attributes={{
      'data-slate-node': 'element',
      ref: null,
    }}
  >
    The quick brown fox jumps over the lazy dog
  </Paragraph>
);

P.storyName = 'Paragraph';
