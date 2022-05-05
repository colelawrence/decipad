import { Meta, Story } from '@storybook/react';
import { TableFormulaCell } from './TableFormulaCell';

export default {
  title: 'Atoms / Editor / Table / Formula',
  component: TableFormulaCell,
  args: {
    children: 'Table Data',
  },
} as Meta;

export const WithRowNumber: Story<typeof TableFormulaCell> = (args) => (
  <TableFormulaCell {...args} />
);
