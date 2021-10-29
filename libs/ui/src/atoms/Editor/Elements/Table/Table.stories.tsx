import { Meta, Story } from '@storybook/react';
import { TableElement } from './Table';

export default {
  title: 'Legacy/Editor/Elements/Table',
  component: TableElement,
  args: {
    children: 'Table Element',
  },
} as Meta;

interface ArgsType {
  children: string;
}

export const Table: Story<ArgsType> = (args) => (
  <TableElement>{args.children}</TableElement>
);
