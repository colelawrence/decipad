import { Meta, Story } from '@storybook/react';
import { UnorderedListElement } from './UnorderedList';

export default {
  title: 'Legacy/Editor/Elements/Unordered List',
  component: UnorderedListElement,
  args: {
    children: 'Notebook Title',
  },
} as Meta;

interface ArgTypes {
  children: string;
}

export const Title: Story<ArgTypes> = (args) => (
  <UnorderedListElement
    attributes={{ 'data-slate-leaf': true, 'data-slate-node': 'element' }}
    leaf={{ text: '' }}
    text={{ text: '' }}
    nodeProps={{ styles: { root: { css: null } } }}
  >
    {args.children}
  </UnorderedListElement>
);
