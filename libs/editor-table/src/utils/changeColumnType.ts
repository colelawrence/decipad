import { Computer } from '@decipad/computer';
import {
  ELEMENT_TABLE_COLUMN_FORMULA,
  ELEMENT_TH,
  MyEditor,
  TableCaptionElement,
  TableCellType,
  TableColumnFormulaElement,
  TableElement,
  TableHeaderElement,
} from '@decipad/editor-types';
import {
  assertElementType,
  getNodeEntrySafe,
  insertNodes,
} from '@decipad/editor-utils';
import { formatResultPreview } from '@decipad/format';
import {
  ELEMENT_TD,
  getNode,
  hasNode,
  insertText,
  setNodes,
  withoutNormalizing,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import { Path } from 'slate';
import { focusCursorOnPath } from '../plugins/createCursorFocusPlugin';
import { findTableFormulaPath } from './findTableFormulaPath';

export const changeColumnType = (
  editor: MyEditor,
  path: Path,
  cellType: TableCellType | undefined,
  columnIndex: number,
  computer?: Computer // Needed when changing from dropdown to other types
) => {
  withoutNormalizing(editor, () => {
    if (cellType?.kind === 'table-formula') {
      setNodes<TableElement>(
        editor,
        {
          hideFormulas: false,
        },
        { at: path }
      );

      focusCursorOnPath(editor, () => {
        const table = getNode<TableElement>(editor, path);
        return table && findTableFormulaPath(table, path, columnIndex);
      });
    }

    const columnHeaderPath = [...path, 1, columnIndex];
    if (hasNode(editor, columnHeaderPath)) {
      const columnHeaderEntry = getNodeEntrySafe(editor, columnHeaderPath);
      if (columnHeaderEntry) {
        const [node] = columnHeaderEntry;
        assertElementType(node, ELEMENT_TH);

        setNodes<TableHeaderElement>(
          editor,
          { cellType },
          {
            at: columnHeaderPath,
          }
        );

        if (cellType?.kind === 'dropdown') {
          let counter = 2;
          let entry = getNodeEntrySafe(editor, [...path, counter, columnIndex]);
          while (entry) {
            entry = getNodeEntrySafe(editor, [...path, counter, columnIndex]);
            counter += 1;
            if (!entry) continue;
            assertElementType(entry[0], ELEMENT_TD);

            insertText(editor, '', {
              at: [...path, counter - 1, columnIndex, 0],
            });
          }
        }

        if (node.cellType.kind === 'dropdown' && computer) {
          let counter = 2;
          let entry = getNodeEntrySafe(editor, [...path, counter, columnIndex]);
          while (entry) {
            entry = getNodeEntrySafe(editor, [...path, counter, columnIndex]);
            counter += 1;
            if (!entry) continue;
            assertElementType(entry[0], ELEMENT_TD);

            const result = computer.getVarResult$.get(
              entry[0].children[0].text
            )?.result;
            if (!result) continue;

            const textResult = formatResultPreview(result);
            insertText(editor, textResult, {
              at: [...path, counter - 1, columnIndex, 0],
            });
          }
        }

        const tableCaptionPath = [...path, 0];
        const caption = getNode<TableCaptionElement>(editor, tableCaptionPath);
        if (!caption) {
          return;
        }
        const newFormulaPath = [...tableCaptionPath, caption.children.length];
        const maybePreviousPath = [
          ...tableCaptionPath,
          caption.children.length - 1,
        ];
        const headerId = getNode<TableHeaderElement>(
          editor,
          columnHeaderPath
        )?.id;
        if (headerId == null) {
          return;
        }
        const maybePreviousNode = getNode<TableColumnFormulaElement>(
          editor,
          maybePreviousPath
        );
        if (
          maybePreviousNode?.type === 'table-column-formula' &&
          maybePreviousNode?.columnId === headerId
        ) {
          setNodes(
            editor,
            { type: 'table-column-formula' },
            {
              at: maybePreviousPath,
            }
          );
        } else {
          insertNodes(
            editor,
            {
              id: nanoid(),
              type: ELEMENT_TABLE_COLUMN_FORMULA,
              children: [{ text: ' ' }],
              columnId: headerId,
            },
            {
              at: newFormulaPath,
            }
          );
        }
      }
    }
  });
};
