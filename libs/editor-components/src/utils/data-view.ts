import {
  ELEMENT_DATA_VIEW,
  ELEMENT_DATA_VIEW_TR,
  DataViewElement,
  ELEMENT_DATA_VIEW_CAPTION,
  ELEMENT_DATA_VIEW_NAME,
} from '@decipad/editor-types';
import { insertNodes, requirePathBelowBlock } from '@decipad/editor-utils';
import { TEditor } from '@udecode/plate';
import cloneDeep from 'lodash.clonedeep';
import { nanoid } from 'nanoid';
import { Path } from 'slate';

const getInitialDataViewElement = (
  blockId?: string,
  varName?: string
): DataViewElement => {
  return {
    id: nanoid(),
    type: ELEMENT_DATA_VIEW,
    expandedGroups: [],
    varName: blockId,
    children: [
      {
        id: nanoid(),
        type: ELEMENT_DATA_VIEW_CAPTION,
        children: [
          {
            id: nanoid(),
            type: ELEMENT_DATA_VIEW_NAME,
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
  blockId?: string,
  varName?: string
): void => {
  const dataView = cloneDeep(getInitialDataViewElement(blockId, varName));
  insertNodes(editor, [dataView], { at: requirePathBelowBlock(editor, path) });
};
