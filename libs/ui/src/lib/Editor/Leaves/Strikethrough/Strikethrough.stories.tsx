import React from 'react';
import { Strikethrough } from './Strikethrough.component';

export default {
  title: 'Editor/Leaves/Strikethrough',
};

export const B = () => (
  <Strikethrough
    text={{ text: 'hello world' }}
    leaf={{ text: 'hello world' }}
    attributes={{
      'data-slate-leaf': true,
    }}
  >
    The quick brown fox jumps over the lazy dog
  </Strikethrough>
);

B.storyName = 'Strikethrough';
