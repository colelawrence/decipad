import React from 'react';
import { Subheading } from './Subheading.component';

export default {
  title: 'Editor/Blocks/Subheading',
  component: Subheading,
};

export const Default = (args: { text: string }) => (
  <Subheading
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
  </Subheading>
);

Default.args = {
  text: 'Subheading',
};

Default.storyName = 'Subheading';
