import { getDefined } from '@decipad/utils';
import { getNode, hasNode, setNodes, withoutNormalizing } from '@udecode/plate';
import {
  ELEMENT_TABLE_COLUMN_FORMULA,
  MyEditor,
  TableCaptionElement,
  TableCellType,
  TableElement,
  TableHeaderElement,
} from '@decipad/editor-types';
import { Path } from 'slate';
import { nanoid } from 'nanoid';
import { insertNodes } from '@decipad/editor-utils';
import { findTableFormulaPath } from './findTableFormulaPath';
import { focusCursorOnPath } from '../plugins/createCursorFocusPlugin';

export const changeColumnType = (
  editor: MyEditor,
  path: Path,
  cellType: TableCellType,
  columnIndex: number
) => {
  withoutNormalizing(editor, () => {
    if (cellType.kind === 'table-formula') {
      focusCursorOnPath(editor, () => {
        const table = getDefined(getNode<TableElement>(editor, path));
        return findTableFormulaPath(table, path, columnIndex);
      });
    }

    const columnHeaderPath = [...path, 1, columnIndex];
    if (hasNode(editor, columnHeaderPath)) {
      setNodes<TableHeaderElement>(
        editor,
        { cellType },
        {
          at: columnHeaderPath,
        }
      );
      const tableCaptionPath = [...path, 0];
      const caption = getDefined(
        getNode<TableCaptionElement>(editor, tableCaptionPath)
      );
      const newFormulaPath = [...tableCaptionPath, caption.children.length];

      const headerId = getDefined(
        getNode<TableHeaderElement>(editor, columnHeaderPath)
      ).id;
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
  });
};
