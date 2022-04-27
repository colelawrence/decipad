import { createOnCursorChangePluginFactory } from '@decipad/editor-plugins';
import { isCollapsed } from '@udecode/plate';
import { Editor, Node, Transforms, Selection, Path, NodeEntry } from 'slate';
import {
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  isElement,
  TableRowElement,
} from '@decipad/editor-types';
import { nanoid } from 'nanoid';
import { getTableColumnCount } from '../utils/getTableColumnCount';
import { getTableRowCount } from '../utils/getTableRowCount';
import { isTableRowEmpty } from '../utils/isTableRowEmpty';

const isInsideTableCell = (node: Node): boolean => {
  return (
    isElement(node) && (node.type === ELEMENT_TD || node.type === ELEMENT_TH)
  );
};

const withAtLastRow =
  (editor: Editor) =>
  (tablePath: Path, tableRowCount: number, tableColumnCount: number) => {
    // user is at the last column: add a column
    const newTrPath = [...tablePath, tableRowCount + 2];
    const newTr: TableRowElement = {
      id: nanoid(),
      type: ELEMENT_TR,
      autoCreated: true,
      children: Array.from({ length: tableColumnCount }, () => ({
        id: nanoid(),
        type: ELEMENT_TD,
        children: [{ text: '' }],
      })),
    };
    Transforms.insertNodes(editor, newTr, { at: newTrPath });
  };

const withNotAtLastRow =
  (editor: Editor) => (tablePath: Path, tableRowCount: number) => {
    const lastRowPath = [...tablePath, tableRowCount + 2];
    if (!Editor.hasPath(editor, lastRowPath)) {
      return;
    }
    const [rowEntry] = Editor.node(
      editor,
      lastRowPath
    ) as NodeEntry<TableRowElement>;
    if (!rowEntry.autoCreated) {
      return;
    }
    if (isTableRowEmpty(editor, tablePath, tableRowCount - 1)) {
      Transforms.removeNodes(editor, { at: lastRowPath });
    }
  };

const onCursorChange = (editor: Editor) => {
  const atLastRow = withAtLastRow(editor);
  const notAtLastRow = withNotAtLastRow(editor);
  return (selection: Selection): void => {
    if (!isCollapsed(selection)) {
      return;
    }
    const cell = Editor.above(editor, { match: isInsideTableCell });
    if (!cell) {
      return;
    }
    const selectionPath = selection?.anchor.path;
    if (!selectionPath) {
      return;
    }
    // is the user at the last column?
    const [, cellPath] = cell;
    const tablePath = cellPath.slice(0, cellPath.length - 2);
    if (!tablePath.length) {
      return;
    }
    const rowPath = selectionPath.slice(0, selectionPath.length - 1);
    const atRow = rowPath[rowPath.length - 1];
    const tableRowCount = getTableRowCount(editor, tablePath);
    if (atRow === tableRowCount - 1) {
      const tableColCount = getTableColumnCount(editor, tablePath);
      if (tableColCount == null) {
        return;
      }
      atLastRow(tablePath, tableRowCount, tableColCount);
    } else if (atRow < tableRowCount - 2) {
      notAtLastRow(tablePath, tableRowCount);
    }
  };
};

export const createExtraRowPlaceholderPlugin =
  createOnCursorChangePluginFactory(
    'CREATE_EXTRA_ROW_PLACEHOLDER_PLUGIN',
    onCursorChange
  );
