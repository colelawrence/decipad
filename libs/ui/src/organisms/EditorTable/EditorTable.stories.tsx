import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import { TableHeaderRow } from '../../molecules';
import { EditorTable } from './EditorTable';

export default {
  title: 'Organisms / Editor / Table',
  component: TableHeaderRow,
  args: {
    value: {
      variableName: 'TableName',
      columns: [
        {
          columnName: 'FirstName',
          cells: ['Mary', 'Pena', 'Zé'],
          cellType: 'string',
        },
        {
          columnName: 'Numbers',
          cells: ['1', '2', '3'],
          cellType: 'number',
        },
      ],
    },
  },
} as Meta;

export const Normal: Story<ComponentProps<typeof EditorTable>> = (args) => (
  <EditorTable {...args} />
);
