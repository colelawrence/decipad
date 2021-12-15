import { Meta, Story } from '@storybook/react';
import { Type } from '@decipad/language';
import { TableResult } from './TableResult';

const type = {
  columnNames: ['H1', 'H2'],
  columnTypes: [{ type: 'string' }, { type: 'number' }],
} as Type;
const args = {
  value: [
    ['A', 'B', 'C'],
    [1, 2, 3],
  ],
};

export default {
  title: 'Organisms / Editor / Result / Table',
  component: TableResult,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => {
  return <TableResult {...props} type={type} />;
};

export const Inline: Story<typeof args> = (props) => {
  return <TableResult {...props} type={type} variant="inline" />;
};
