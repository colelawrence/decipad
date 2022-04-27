import { Meta, Story } from '@storybook/react';
import { getStringType } from '../../utils';
import { TableHeaderRow } from '../../molecules';
import { TableColumnHeader } from './TableColumnHeader';

export default {
  title: 'Organisms / Table / Column Header',
  component: TableHeaderRow,
} as Meta;

export const Normal: Story = () => (
  <table>
    <TableColumnHeader type={getStringType()} />
  </table>
);
