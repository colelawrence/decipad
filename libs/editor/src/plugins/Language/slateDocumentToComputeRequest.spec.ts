import { types } from '@decipad/editor-config';
import {
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_H1,
  ELEMENT_INPUT,
  ELEMENT_PARAGRAPH,
  ELEMENT_TABLE_INPUT,
} from '@decipad/editor-types';
import { ParsedBlock, prettyPrintAST } from '@decipad/language';
import { slateDocumentToComputeRequest } from './slateDocumentToComputeRequest';

const testTableData: types.TableData = {
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

it('can find tables in the document', () => {
  const { program } = slateDocumentToComputeRequest([
    {
      id: 'line-id1',
      type: ELEMENT_H1,
      children: [{ text: '' }],
    },
    {
      type: ELEMENT_TABLE_INPUT,
      children: [{ text: '' }],
      id: 'the-table-id',
      tableData: testTableData,
    },
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

it('can find inputs in the document', () => {
  const { program } = slateDocumentToComputeRequest([
    {
      id: 'id1',
      type: ELEMENT_H1,
      children: [{ text: '' }],
    },
    {
      type: ELEMENT_INPUT,
      children: [{ text: '' }],
      id: 'input-id',
      value: '10',
      variableName: 'var',
    },
  ]);

  expect(prettyPrintAST((program[0] as ParsedBlock).block))
    .toMatchInlineSnapshot(`
    "(block
      (assign
        (def var)
        10))"
  `);
});

it('can find code lines in the document', () => {
  const { program } = slateDocumentToComputeRequest([
    {
      id: 'line-id1',
      type: ELEMENT_H1,
      children: [{ text: '' }],
    },
    {
      type: ELEMENT_CODE_BLOCK,
      id: 'block-id',
      children: [
        {
          type: ELEMENT_CODE_LINE,
          id: 'line-id',
          children: [{ text: 'A = 10' }],
        },
      ],
    },
  ]);
  expect(program[0]).toEqual({
    id: 'line-id',
    source: 'A = 10',
    type: 'unparsed-block',
  });
});

it('cannot find other elements in the document', () => {
  const { program } = slateDocumentToComputeRequest([
    {
      id: 'line-id1',
      type: ELEMENT_H1,
      children: [{ text: '' }],
    },
    {
      id: 'line-id2',
      type: ELEMENT_PARAGRAPH,
      children: [{ text: '' }],
    },
    {
      id: 'line-id3',
      type: ELEMENT_H1,
      children: [{ text: '' }],
    },
  ]);

  expect(program).toHaveLength(0);
});
