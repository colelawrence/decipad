import {
  ELEMENT_DATA_VIEW,
  ELEMENT_DATA_VIEW_TR,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_VARIABLE_NAME,
  DataViewElement,
  MyEditor,
} from '@decipad/editor-types';
import { insertNodes, requirePathBelowBlock } from '@decipad/editor-utils';
import { findNode, focusEditor, TEditor } from '@udecode/plate';
import { clone } from 'lodash';
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
  blockId?: string,
  varName?: string
): void => {
  const dataView = clone(
    getInitialDataViewElement(blockId, varName)
  ) as unknown as DataViewElement;
  const newPath = requirePathBelowBlock(editor, path);
  insertNodes(editor, dataView, {
    at: newPath,
  });
  setTimeout(() => {
    const findPath = [...newPath, 0];
    const node = findNode(editor, {
      at: findPath,
      block: true,
      match: (_e, p) => Path.equals(findPath, p),
    });
    if (node) {
      focusEditor(editor as MyEditor, { path: findPath, offset: 0 });
    }
  }, 0);
};
