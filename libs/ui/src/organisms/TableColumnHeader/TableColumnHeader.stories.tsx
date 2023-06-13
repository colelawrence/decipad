import { Meta, StoryFn } from '@storybook/react';
import { TableHeaderRow } from '../../molecules';
import { getStringType } from '../../utils';
import { TableColumnHeader } from './TableColumnHeader';

export default {
  title: 'Organisms / Editor /  Table / Column Header',
  component: TableHeaderRow,
} as Meta;

export const Normal: StoryFn = () => (
  <table>
    <TableColumnHeader type={getStringType()} />
  </table>
);
