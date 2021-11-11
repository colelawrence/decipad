import { Meta, Story } from '@storybook/react';
import { TableHeader } from '../../atoms';
import { TableHeaderRow } from './TableHeaderRow';

export default {
  title: 'Molecules / Table / Header Row',
  component: TableHeaderRow,
} as Meta;

export const Normal: Story = () => (
  <table>
    <TableHeaderRow>
      <TableHeader type="string">Header1</TableHeader>
      <TableHeader type="number">Header2</TableHeader>
    </TableHeaderRow>
  </table>
);
