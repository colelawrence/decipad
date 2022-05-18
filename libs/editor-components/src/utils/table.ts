import {
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_VARIABLE_NAME,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  TableElement,
} from '@decipad/editor-types';
import { requirePathBelowBlock } from '@decipad/editor-utils';
import { TEditor } from '@udecode/plate';
import { clone } from 'lodash';
import { nanoid } from 'nanoid';
import { Path, Transforms } from 'slate';
import { GetAvailableIdentifier } from './slashCommands';

const initialTableElement = {
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
} as const;

export const insertTableBelow = (
  editor: TEditor,
  path: Path,
  getAvailableIdentifier: GetAvailableIdentifier
): void => {
  const table = clone(initialTableElement) as unknown as TableElement;
  table.children[0].children[0].children[0].text = getAvailableIdentifier(
    'Table',
    1
  );
  table.id = nanoid();
  Transforms.insertNodes(editor, table, {
    at: requirePathBelowBlock(editor, path),
  });
};
