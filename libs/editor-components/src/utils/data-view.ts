import {
  ELEMENT_DATA_VIEW,
  ELEMENT_DATA_VIEW_TR,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_VARIABLE_NAME,
  DataViewElement,
} from '@decipad/editor-types';
import { requirePathBelowBlock } from '@decipad/editor-utils';
import { insertNodes, TEditor } from '@udecode/plate';
import { clone } from 'lodash';
import { nanoid } from 'nanoid';
import { Path } from 'slate';

const getInitialDataViewElement = (varName?: string): DataViewElement => {
  return {
    id: nanoid(),
    type: ELEMENT_DATA_VIEW,
    varName,
    children: [
      {
        id: nanoid(),
        type: ELEMENT_TABLE_CAPTION,
        children: [
          {
            id: nanoid(),
            type: ELEMENT_TABLE_VARIABLE_NAME,
            children: [
              { text: `Data view${varName ? ` for ${varName}` : ''}` },
            ],
          },
        ],
      },
      {
        id: nanoid(),
        type: ELEMENT_DATA_VIEW_TR,
        children: [],
      },
    ],
  };
};

export const insertDataViewBelow = (
  editor: TEditor,
  path: Path,
  varName?: string
): void => {
  const dataView = clone(
    getInitialDataViewElement(varName)
  ) as unknown as DataViewElement;
  insertNodes(editor, dataView, {
    at: requirePathBelowBlock(editor, path),
  });
};
