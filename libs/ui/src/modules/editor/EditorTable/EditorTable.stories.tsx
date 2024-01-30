import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { EditorTable } from './EditorTable';

export default {
  title: 'Organisms / Editor / Table',
  component: EditorTable,
  args: {
    columns: [
      {
        columnName: 'FirstName',
        cells: ['Mary', 'Pena', 'Zé'],
        cellType: { kind: 'string' },
      },
      {
        columnName: 'Numbers',
        cells: ['1', '2', '3'],
        cellType: { kind: 'number', unit: null },
      },
    ],
  },
} as Meta;

export const Normal: StoryFn<ComponentProps<typeof EditorTable>> = (args) => (
  <EditorTable {...args} />
);
