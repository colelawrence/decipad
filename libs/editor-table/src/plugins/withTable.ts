/* eslint-disable no-param-reassign */
import {
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  getMyEditor,
  MyWithOverride,
} from '@decipad/editor-types';
import { isElement, withTable as withPlateTable } from '@udecode/plate';
import { createTableCaption } from '../utils/createTableCaption';

export const withTable: MyWithOverride = (editor, plugin) => {
  editor = withPlateTable(editor, plugin);

  const myEditor = getMyEditor(editor);
  const { insertFragment } = myEditor;

  myEditor.insertFragment = (fragment) => {
    fragment = fragment.map((node) => {
      if (isElement(node) && node.type === ELEMENT_TABLE) {
        if (node.children[0]?.type !== ELEMENT_TABLE_CAPTION) {
          node.children.unshift(
            createTableCaption({
              id: node.id,
            })
          );
          return node;
        }
      }

      return node;
    });

    insertFragment(fragment);
  };

  return editor;
};
