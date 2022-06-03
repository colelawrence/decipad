import { getDefined } from '@decipad/utils';
import { getNode, hasNode, setNodes } from '@udecode/plate';
import {
  MyEditor,
  TableCellType,
  TableElement,
  TableHeaderElement,
} from '@decipad/editor-types';
import { Path } from 'slate';
import { findTableFormulaPath } from './findTableFormulaPath';
import { focusCursorOnPath } from '../plugins/createCursorFocusPlugin';

export const changeColumnType = (
  editor: MyEditor,
  path: Path,
  cellType: TableCellType,
  columnIndex: number
) => {
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
  }
};
