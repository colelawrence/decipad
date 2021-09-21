import { ParsedBlock, prettyPrintAST } from '@decipad/language';
import { ELEMENT_TABLE } from '@udecode/plate';
import { SlateNode } from './common';
import { InteractiveTable } from './extractTable';
import { slateDocumentToComputeRequest } from './slateDocumentToComputeRequest';

// Can't use apache arrow in jest
jest.mock('@apache-arrow/es5-cjs', () => ({}));

const testTableChildren: InteractiveTable['children'] = [
  {
    type: 'tr',
    attributes: { isHeader: true },
    children: [
      {
        type: 'th',
        attributes: { title: true },
        children: [{ text: 'TheTitle' }],
      },
    ],
  },
  {
    type: 'tr',
    attributes: { isColumnNames: true },
    children: [
      {
        type: 'th',
        children: [{ text: 'Col1' }],
      },
      {
        type: 'th',
        children: [{ text: 'Col2' }],
      },
    ],
  },
  {
    type: 'tr',
    children: [
      {
        type: 'td',
        children: [{ text: 'Hello' }],
      },
      {
        type: 'td',
        children: [{ text: 'World' }],
      },
    ],
  },
  {
    type: 'tr',
    children: [
      {
        type: 'td',
        children: [{ text: 'Row 2' }],
      },
      {
        type: 'td',
        children: [{ text: 'Row 2 Col 2' }],
      },
    ],
  },
];

const table = {
  type: ELEMENT_TABLE,
  id: 'the-table-id',
  children: testTableChildren,
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
            Col1 (column \\"Hello\\" \\"Row 2\\")
            Col2 (column \\"World\\" \\"Row 2 Col 2\\"))))"
    `);
});
