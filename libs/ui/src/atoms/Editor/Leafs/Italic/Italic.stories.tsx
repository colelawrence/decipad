import { Meta, Story } from '@storybook/react';
import { ItalicLeaf } from './Italic';

export default {
  title: 'Atoms/Editor/Leafs/Italic',
  component: ItalicLeaf,
  args: {
    text: 'Italic text',
  },
} as Meta;

export const Italic: Story<{ text: string }> = (args) => (
  <ItalicLeaf
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
  </ItalicLeaf>
);
