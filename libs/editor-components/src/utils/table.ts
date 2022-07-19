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
import { requirePathBelowBlock } from '@decipad/editor-utils';
import { insertNodes } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { Path } from 'slate';
import { GetAvailableIdentifier } from './slashCommands';

const initialTableElement = () => {
  return {
    type: ELEMENT_TABLE,
    children: [
      {
        type: ELEMENT_TABLE_CAPTION,
        children: [
          {
            type: ELEMENT_TABLE_VARIABLE_NAME,
            children: [{ text: '' }],
          },
        ],
      },
      {
        type: ELEMENT_TR,
        children: [
          {
            type: ELEMENT_TH,
            cellType: { kind: 'string' },
            children: [{ text: 'Column1' }],
          },
          {
            type: ELEMENT_TH,
            cellType: { kind: 'number' },
            children: [{ text: 'Column2' }],
          },
          {
            type: ELEMENT_TH,
            cellType: { kind: 'number' },
            children: [{ text: 'Column3' }],
          },
        ],
      },
      {
        type: ELEMENT_TR,
        children: [
          {
            type: ELEMENT_TD,
            children: [{ text: '' }],
          },
        ],
      },
      {
        type: ELEMENT_TR,
        children: [
          {
            type: ELEMENT_TD,
            children: [{ text: '' }],
          },
        ],
      },
      {
        type: ELEMENT_TR,
        children: [
          {
            type: ELEMENT_TD,
            children: [{ text: '' }],
          },
        ],
      },
    ],
  } as unknown as TableElement;
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
  table.id = nanoid();
  insertNodes(editor, table, {
    at: requirePathBelowBlock(editor, path),
  });
};
