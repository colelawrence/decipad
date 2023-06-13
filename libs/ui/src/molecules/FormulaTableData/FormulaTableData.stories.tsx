import { Meta, StoryFn } from '@storybook/react';
import { FormulaTableData } from './FormulaTableData';

export default {
  title: 'Atoms / Editor / Table / Formula Result',
  component: FormulaTableData,
  args: {
    children: 'Table Data',
    result: <>CodeResult goes here</>,
  },
} as Meta;

export const WithRowNumber: StoryFn<typeof FormulaTableData> = (args) => (
  <FormulaTableData {...args} />
);
