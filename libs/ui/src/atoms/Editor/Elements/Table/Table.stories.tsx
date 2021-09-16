import { Meta, Story } from '@storybook/react';
import { TableElement } from './Table';

export default {
  title: 'Atoms/Editor/Elements/Table',
  component: TableElement,
  args: {
    children: 'Table Element',
  },
} as Meta;

interface ArgsType {
  children: string;
}

export const Table: Story<ArgsType> = (args) => (
  <TableElement
    attributes={{ 'data-slate-leaf': true, 'data-slate-node': 'element' }}
    leaf={{ text: '' }}
    text={{ text: '' }}
    nodeProps={{ styles: { root: { css: null } } }}
  >
    {args.children}
  </TableElement>
);
