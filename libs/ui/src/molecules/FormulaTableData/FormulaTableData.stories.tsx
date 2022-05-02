import { Meta, Story } from '@storybook/react';
import { FormulaTableData } from './FormulaTableData';

export default {
  title: 'Atoms / Table / Data',
  component: FormulaTableData,
  args: {
    children: 'Table Data',
    result: <>CodeResult goes here</>,
  },
} as Meta;

export const WithRowNumber: Story<typeof FormulaTableData> = (args) => (
  <FormulaTableData {...args} />
);
