import { Meta, Story } from '@storybook/react';
import { ListItemElement } from './ListItem';

export default {
  title: 'Atoms/Editor/Elements/Title',
  component: ListItemElement,
  args: {
    children: 'Notebook Title',
  },
} as Meta;

interface ArgTypes {
  children: string;
}

export const Title: Story<ArgTypes> = (args) => (
  <ListItemElement
    attributes={{ 'data-slate-leaf': true, 'data-slate-node': 'element' }}
    leaf={{ text: '' }}
    text={{ text: '' }}
    nodeProps={{ styles: { root: { css: null } } }}
  >
    {args.children}
  </ListItemElement>
);
