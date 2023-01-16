import { Meta, Story } from '@storybook/react';
import { TableData } from './TableData';

export default {
  title: 'Atoms / Editor / Table / Data',
  component: TableData,
  args: {
    children: 'Table Data',
  },
} as Meta;

export const WithRowNumber: Story<typeof TableData> = (args) => (
  <TableData {...(args as any)} />
);
