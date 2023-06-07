import {
  ELEMENT_DATA_VIEW,
  ELEMENT_DATA_VIEW_TR,
  DataViewElement,
  MyEditor,
  ELEMENT_DATA_VIEW_CAPTION,
  ELEMENT_DATA_VIEW_NAME,
} from '@decipad/editor-types';
import { insertNodes, requirePathBelowBlock } from '@decipad/editor-utils';
import { findNode, focusEditor, TEditor } from '@udecode/plate';
import clone from 'lodash.clonedeep';
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
  const dataView = clone(getInitialDataViewElement(blockId, varName));

  const newPath = requirePathBelowBlock(editor, path);

  insertNodes(editor, dataView, { at: newPath });

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
