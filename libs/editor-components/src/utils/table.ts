import {
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_VARIABLE_NAME,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  MyEditor,
  TableElement,
} from '@decipad/editor-types';
import { insertNodes, requirePathBelowBlock } from '@decipad/editor-utils';
import { nanoid } from 'nanoid';
import { Path } from 'slate';
import type { GetAvailableIdentifier } from './slashCommands';

const initialTableElement = () => {
  return {
    id: nanoid(),
    type: ELEMENT_TABLE,
    children: [
      {
        id: nanoid(),
        type: ELEMENT_TABLE_CAPTION,
        children: [
          {
            id: nanoid(),
            type: ELEMENT_TABLE_VARIABLE_NAME,
            children: [{ text: '' }],
          },
        ],
      },
      {
        id: nanoid(),
        type: ELEMENT_TR,
        children: [
          {
            id: nanoid(),
            type: ELEMENT_TH,
            cellType: { kind: 'anything' },
            children: [{ text: 'Column1' }],
          },
          {
            id: nanoid(),
            type: ELEMENT_TH,
            cellType: { kind: 'anything' },
            children: [{ text: 'Column2' }],
          },
          {
            id: nanoid(),
            type: ELEMENT_TH,
            cellType: { kind: 'anything' },
            children: [{ text: 'Column3' }],
          },
        ],
      },
      {
        id: nanoid(),
        type: ELEMENT_TR,
        children: [
          {
            id: nanoid(),
            type: ELEMENT_TD,
            children: [{ text: '' }],
          },
        ],
      },
      {
        id: nanoid(),
        type: ELEMENT_TR,
        children: [
          {
            id: nanoid(),
            type: ELEMENT_TD,
            children: [{ text: '' }],
          },
        ],
      },
      {
        id: nanoid(),
        type: ELEMENT_TR,
        children: [
          {
            id: nanoid(),
            type: ELEMENT_TD,
            children: [{ text: '' }],
          },
        ],
      },
    ],
  } as TableElement;
};

export const insertTableBelow = (
  editor: MyEditor,
  path: Path,
  getAvailableIdentifier: GetAvailableIdentifier
): void => {
  const table = initialTableElement();
  table.children[0].children[0].children[0].text = getAvailableIdentifier(
    'Table',
    1
  );
  insertNodes(editor, table, {
    at: requirePathBelowBlock(editor, path),
  });
};
