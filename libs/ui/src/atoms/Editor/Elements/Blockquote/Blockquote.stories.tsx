import { Meta, Story } from '@storybook/react';
import { BlockquoteElement } from './Blockquote';

export default {
  title: 'Atoms/Editor/Elements/Blockquote',
  component: BlockquoteElement,
  args: {
    children: 'Blockquote Element',
  },
} as Meta;

interface ArgsType {
  children: string;
}

export const Blockquote: Story<ArgsType> = (args) => (
  <BlockquoteElement
    attributes={{ 'data-slate-leaf': true, 'data-slate-node': 'element' }}
    leaf={{ text: '' }}
    text={{ text: '' }}
    nodeProps={{ styles: { root: { css: null } } }}
  >
    {args.children}
  </BlockquoteElement>
);
