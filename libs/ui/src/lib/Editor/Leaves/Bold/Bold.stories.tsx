import React from 'react';
import { Bold } from './Bold.component';

export default {
  title: 'Editor/Leaves/Bold',
};

export const B = () => (
  <Bold
    text={{ text: 'hello world' }}
    leaf={{ text: 'hello world' }}
    attributes={{
      'data-slate-leaf': true,
    }}
  >
    The quick brown fox jumps over the lazy dog
  </Bold>
);

B.storyName = 'Bold';
