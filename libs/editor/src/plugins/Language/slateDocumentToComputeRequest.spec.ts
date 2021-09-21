import { ParsedBlock, prettyPrintAST } from '@decipad/language';
import {
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
} from '@udecode/plate';
import {
  ELEMENT_HEAD_TR,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TBODY,
  ELEMENT_THEAD,
} from '../../utils/elementTypes';
import { InteractiveTable } from '../InteractiveTable/table';
import { SlateNode } from './common';
import { slateDocumentToComputeRequest } from './slateDocumentToComputeRequest';

// Can't use apache arrow in jest
jest.mock('@apache-arrow/es5-cjs', () => ({}));

const testTableChildren: InteractiveTable['children'] = [
  {
    type: ELEMENT_TABLE_CAPTION,
    children: [{ text: 'TheTitle' }],
  },
  {
    type: ELEMENT_THEAD,
    children: [
      {
        type: ELEMENT_HEAD_TR,
        children: [
          {
            type: ELEMENT_TH,
            children: [{ text: 'Col1' }],
          },
          {
            type: ELEMENT_TH,
            children: [{ text: 'Col2' }],
          },
        ],
      },
    ],
  },
  {
    type: ELEMENT_TBODY,
    children: [
      {
        type: ELEMENT_TR,
        children: [
          {
            type: ELEMENT_TD,
            children: [{ text: 'Hello' }],
          },
          {
            type: ELEMENT_TD,
            children: [{ text: 'World' }],
          },
        ],
      },
      {
        type: ELEMENT_TR,
        children: [
          {
            type: ELEMENT_TD,
            children: [{ text: 'Row 2' }],
          },
          {
            type: ELEMENT_TD,
            children: [{ text: 'Row 2 Col 2' }],
          },
        ],
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
