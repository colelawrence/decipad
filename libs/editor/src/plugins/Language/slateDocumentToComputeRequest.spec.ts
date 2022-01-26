import { ParsedBlock, prettyPrintAST } from '@decipad/language';
import { ELEMENT_TABLE_INPUT } from '../../elements';
import { TableData } from '../../types';
import { SlateNode } from './common';
import { slateDocumentToComputeRequest } from './slateDocumentToComputeRequest';

// Can't use apache arrow in jest
jest.mock('@apache-arrow/es5-cjs', () => ({}));

const testTableData: TableData = {
  variableName: 'TheTitle',
  columns: [
    {
      columnName: 'Col1',
      cellType: { kind: 'string' },
      cells: ['Hello', 'World'],
    },
    {
      columnName: 'Col2',
      cellType: { kind: 'number', unit: null },
      cells: ['123', '456'],
    },
    {
      columnName: 'Col3',
      cellType: { kind: 'date', date: 'year' },
      cells: ['2020', '2030'],
    },
  ],
};

const table = {
  type: ELEMENT_TABLE_INPUT,
  id: 'the-table-id',
  tableData: testTableData,
  children: [],
};

it('can find tables in the document', () => {
  const { program } = slateDocumentToComputeRequest([
    table as unknown as SlateNode,
  ]);

  expect(prettyPrintAST((program[0] as ParsedBlock).block))
    .toMatchInlineSnapshot(`
    "(block
      (assign
        (def TheTitle)
        (table
          Col1 (column \\"Hello\\" \\"World\\")
          Col2 (column 123 456)
          Col3 (column (date year 2020) (date year 2030)))))"
  `);
});
