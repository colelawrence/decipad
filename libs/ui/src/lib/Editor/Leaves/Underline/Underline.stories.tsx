import React from 'react';
import { Underline } from './Underline.component';

export default {
  title: 'Editor/Leaves/Underline',
};

export const B = () => (
  <Underline
    text={{ text: 'hello world' }}
    leaf={{ text: 'hello world' }}
    attributes={{
      'data-slate-leaf': true,
    }}
  >
    The quick brown fox jumps over the lazy dog
  </Underline>
);

B.storyName = 'Underline';
