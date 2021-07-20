import React from 'react';
import { Title } from './Title.component';

export default {
  title: 'Editor/Blocks/Title',
  component: Title,
};

export const Default = (args: { text: string }) => (
  <Title
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
  </Title>
);

Default.args = {
  text: 'Title',
};

Default.storyName = 'Title';
