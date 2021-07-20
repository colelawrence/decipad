import React from 'react';
import { Underline } from './Underline.component';

export default {
  title: 'Editor/Leafs/Underline',
  component: Underline,
};

export const Default = (args: { text: string }) => (
  <Underline
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
  </Underline>
);

Default.args = {
  text: 'Underline',
};

Default.storyName = 'Underline';
