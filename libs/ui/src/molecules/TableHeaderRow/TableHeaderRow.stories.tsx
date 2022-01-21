import { Meta, Story } from '@storybook/react';
import { TableHeader } from '../../atoms';
import { getNumberType, getStringType } from '../../utils';
import { TableHeaderRow } from './TableHeaderRow';

export default {
  title: 'Molecules / Table / Header Row',
  component: TableHeaderRow,
} as Meta;

export const Normal: Story = () => (
  <table>
    <TableHeaderRow>
      <TableHeader type={getStringType()}>Header1</TableHeader>
      <TableHeader type={getNumberType()}>Header2</TableHeader>
    </TableHeaderRow>
  </table>
);

export const ReadOnly: Story = () => (
  <table>
    <TableHeaderRow readOnly>
      <TableHeader type={getStringType()}>Header1</TableHeader>
      <TableHeader type={getNumberType()}>Header2</TableHeader>
    </TableHeaderRow>
  </table>
);
