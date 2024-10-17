import { Meta, StoryFn } from '@storybook/react';
import { TableData, TableDataProps } from './TableData';

export default {
  title: 'Atoms / Editor / Table / Data',
  component: TableData,
  args: {
    children: 'Table Data',
  },
} as Meta;

export const WithRowNumber: StoryFn<typeof TableData> = (
  args: TableDataProps
) => <TableData {...(args as any)} />;
