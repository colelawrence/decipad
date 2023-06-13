import { Meta, StoryFn } from '@storybook/react';
import { TableHeader } from '../../atoms';
import { getNumberType, getStringType } from '../../utils';
import { TableHeaderRow } from './TableHeaderRow';

export default {
  title: 'Molecules / Editor / Table / Header Row',
  component: TableHeaderRow,
} as Meta;

export const Normal: StoryFn = () => (
  <table>
    <TableHeaderRow>
      <TableHeader type={getStringType()}>Header1</TableHeader>
      <TableHeader type={getNumberType()}>Header2</TableHeader>
    </TableHeaderRow>
  </table>
);

export const ReadOnly: StoryFn = () => (
  <table>
    <TableHeaderRow readOnly>
      <TableHeader type={getStringType()}>Header1</TableHeader>
      <TableHeader type={getNumberType()}>Header2</TableHeader>
    </TableHeaderRow>
  </table>
);
