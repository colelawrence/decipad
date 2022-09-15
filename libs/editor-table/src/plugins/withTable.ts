/* eslint-disable no-param-reassign */
import {
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TH,
  ELEMENT_TR,
  getMyEditor,
  MyElement,
  MyValue,
  MyWithOverride,
  TableHeaderRowElement,
} from '@decipad/editor-types';
import {
  isElement,
  someNode,
  withDeleteTable,
  withGetFragmentTable,
  withInsertFragmentTable,
  withInsertTextTable,
  withSelectionTable,
} from '@udecode/plate';
import { createTableCaption } from '../utils/createTableCaption';

const createEmptyTableHeaderCell = () => ({
  type: ELEMENT_TH,
  cellType: {
    kind: 'string',
  },
  children: [{ text: '' }],
});

export const withTable: MyWithOverride = (editor, plugin) => {
  editor = withDeleteTable<MyValue>(editor);
  editor = withGetFragmentTable<MyValue>(editor);
  editor = withInsertFragmentTable<MyValue>(editor, plugin);
  editor = withInsertTextTable<MyValue>(editor, plugin);
  editor = withSelectionTable<MyValue>(editor);

  const myEditor = getMyEditor(editor);
  const { insertFragment } = myEditor;

  /**
   * If not in a table and inserted table has no caption:
   * - add a table caption as first child
   * - add an empty header row if first row is not composed of th
   */
  myEditor.insertFragment = (fragment) => {
    if (!someNode(editor, { match: { type: ELEMENT_TABLE } })) {
      fragment = fragment.map((node) => {
        if (isElement(node) && node.type === ELEMENT_TABLE) {
          if (!node.children.length) return node;

          if (node.children[0].type !== ELEMENT_TABLE_CAPTION) {
            const isHeaderRow = node.children[0].children.every(
              (cell) => (cell as MyElement).type === ELEMENT_TH
            );

            if (!isHeaderRow) {
              const cells = Array.from(
                { length: node.children[0].children.length },
                createEmptyTableHeaderCell
              );

              node.children.unshift({
                type: ELEMENT_TR,
                children: cells,
              } as unknown as TableHeaderRowElement);
            }

            node.children.unshift(
              createTableCaption({
                id: node.id,
              })
            );
          }
        }

        return node;
      });
    }

    insertFragment(fragment);
  };

  return editor;
};
