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
import { isElement, someNode, TDescendant, Value } from '@udecode/plate-common';
import {
  withDeleteTable,
  withGetFragmentTable,
  withSelectionTable,
} from '@udecode/plate-table';
import { createTableCaption } from '../utils/createTableCaption';
import { withInsertFragmentTable } from './withInsertFragmentTable';
import { withInsertTextTable } from './withInsertTextTable';

const createEmptyTableHeaderCell = () => ({
  type: ELEMENT_TH,
  cellType: {
    kind: 'string',
  },
  children: [{ text: '' }],
});

export const withTable =
  <TV extends Value = MyValue>(): MyWithOverride<object, TV> =>
  (editor, plugin) => {
    editor = withDeleteTable<TV>(editor);
    editor = withInsertTextTable<TV>(editor);
    editor = withGetFragmentTable<TV>(editor);
    editor = withInsertFragmentTable<TV>(editor, plugin);
    editor = withSelectionTable<TV>(editor);

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
              const isHeaderRow = (
                node.children[0]?.children as Array<TDescendant> | undefined
              )?.every((cell) => (cell as MyElement).type === ELEMENT_TH);

              if (!isHeaderRow) {
                const cells = Array.from(
                  {
                    length:
                      (
                        node.children[0]?.children as
                          | Array<TDescendant>
                          | undefined
                      )?.length ?? 1,
                  },
                  createEmptyTableHeaderCell
                );
                node.children.unshift({
                  type: ELEMENT_TR,
                  children: cells,
                } as unknown as TableHeaderRowElement);
              }

              node.children.unshift(
                createTableCaption({
                  id: node.id as string,
                })
              );
            }

            // clear up cell content
            const trWithCells = node.children.slice(2);
            trWithCells.map((tr) => {
              const cells = (tr.children ?? []) as Array<TDescendant>;
              cells.map((td) => {
                const cellCores = (td.children ?? []) as Array<TDescendant>;
                cellCores.map((core) => {
                  if (core.text && typeof core.text === 'string') {
                    core.text = core.text.trim();
                  }
                });
              });
              return cells;
            });
          }

          return node;
        });
      }

      insertFragment(fragment);
    };

    return editor;
  };
