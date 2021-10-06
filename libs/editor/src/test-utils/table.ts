import {
  ELEMENT_TABLE,
  ELEMENT_TH,
  ELEMENT_TR,
  ELEMENT_TD,
} from '@udecode/plate';
import {
  InteractiveTable,
  TableCellType,
  Td,
  Th,
} from '../plugins/InteractiveTable/table';
import {
  ELEMENT_TABLE_CAPTION,
  ELEMENT_THEAD,
  ELEMENT_HEAD_TR,
  ELEMENT_TBODY,
} from '../utils/elementTypes';

/**
 * Creates a row with 1 named column and {@param numberOfRows} rows of non-empty cells.
 */
export const createTable = (numberOfRows: number): InteractiveTable => ({
  type: ELEMENT_TABLE,
  children: [
    {
      type: ELEMENT_TABLE_CAPTION,
      children: [{ text: 'Table' }],
    },
    {
      type: ELEMENT_THEAD,
      children: [
        {
          type: ELEMENT_HEAD_TR,
          children: [
            {
              type: ELEMENT_TH,
              attributes: { cellType: 'string' },
              children: [{ text: 'Col 1' }],
            },
          ],
        },
      ],
    },
    {
      type: ELEMENT_TBODY,
      children: Array.from({ length: numberOfRows }, (_, i) => ({
        type: ELEMENT_TR,
        children: [
          {
            type: ELEMENT_TD,
            attributes: { cellType: 'string' },
            children: [{ text: `Col 1 Row ${i + 1}` }],
          },
        ],
      })),
    },
  ],
});

export const createTableWithTypeAndData = (
  cellType: TableCellType,
  data: string[]
): InteractiveTable => ({
  type: ELEMENT_TABLE,
  children: [
    {
      type: ELEMENT_TABLE_CAPTION,
      children: [{ text: 'Table' }],
    },
    {
      type: ELEMENT_THEAD,
      children: [
        {
          type: ELEMENT_HEAD_TR,
          children: [
            {
              type: ELEMENT_TH,
              attributes: { cellType },
              children: [{ text: 'Col 1' }],
            },
          ],
        },
      ],
    },
    {
      type: ELEMENT_TBODY,
      children: data.map((text) => ({
        type: ELEMENT_TR,
        children: [
          {
            type: ELEMENT_TD,
            attributes: { cellType },
            children: [{ text }],
          },
        ],
      })),
    },
  ],
});

export const printTable = ({
  children: [_, thead, tbody],
}: InteractiveTable): string[] => {
  const tdsToStrings = (tds: (Th | Td)[]) =>
    tds.map((td) => td.children[0].text).join(' | ');

  return [
    tdsToStrings(thead.children[0].children),
    ...tbody.children.map((tr) => tdsToStrings(tr.children)),
  ];
};
