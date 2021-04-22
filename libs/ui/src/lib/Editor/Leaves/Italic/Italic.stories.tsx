import React from 'react';
import { Italic } from './Italic.component';

export default {
  title: 'Editor/Leaves/Italic',
};

export const B = () => (
  <Italic
    text={null}
    leaf={null}
    attributes={{
      'data-slate-leaf': true,
    }}
  >
    The quick brown fox jumps over the lazy dog
  </Italic>
);

B.storyName = 'Italic';
