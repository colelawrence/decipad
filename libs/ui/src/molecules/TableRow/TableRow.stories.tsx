import { Meta, Story } from '@storybook/react';
import { TableData } from '../../atoms';
import { TableRow } from './TableRow';

export default {
  title: 'Molecules / Table / Row',
  component: TableRow,
} as Meta;

export const Normal: Story = () => (
  <table>
    <TableRow>
      <TableData>Cell 1</TableData>
      <TableData>Cell 2</TableData>
      <TableData>Cell 3</TableData>
    </TableRow>
    <TableRow>
      <TableData>Cell 1</TableData>
      <TableData>Cell 2</TableData>
      <TableData>Cell 3</TableData>
    </TableRow>
  </table>
);
