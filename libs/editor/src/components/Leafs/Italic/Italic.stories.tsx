import React from 'react';
import { Italic } from './Italic.component';

export default {
  title: 'Editor/Leafs/Italic',
  component: Italic,
};

export const Default = (args: { text: string }) => (
  <Italic
    leaf={{ attributes: {}, text: '' }}
    element={{ children: [{ text: '' }] }}
    text={{ text: '' }}
    attributes={{
      'data-slate-node': 'element',
      ref: null,
      'data-slate-leaf': true,
    }}
  >
    {args.text}
  </Italic>
);

Default.args = {
  text: 'Italic',
};

Default.storyName = 'Italic';
