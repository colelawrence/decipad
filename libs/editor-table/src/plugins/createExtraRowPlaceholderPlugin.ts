import { createOnCursorChangePluginFactory } from '@decipad/editor-plugins';
import { hasNode, isCollapsed, isElement, removeNodes } from '@udecode/plate';
import { Path, Selection } from 'slate';
import {
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  MyEditor,
  MyNode,
  TableRowElement,
} from '@decipad/editor-types';
import { nanoid } from 'nanoid';
import {
  getAboveNodeSafe,
  getNodeEntrySafe,
  insertNodes,
  isElementOfType,
} from '@decipad/editor-utils';
import { getTableColumnCount } from '../utils/getTableColumnCount';
import { getTableRowCount } from '../utils/getTableRowCount';
import { isTableRowEmpty } from '../utils/isTableRowEmpty';

const isInsideTableCell = (node: MyNode): boolean => {
  return (
    isElement(node) && (node.type === ELEMENT_TD || node.type === ELEMENT_TH)
  );
};

const withAtLastRow =
  (editor: MyEditor) =>
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
    insertNodes(editor, newTr, { at: newTrPath });
  };

const withNotAtLastRow =
  (editor: MyEditor) => (tablePath: Path, tableRowCount: number) => {
    const lastRowPath = [...tablePath, tableRowCount + 2];
    if (!hasNode(editor, lastRowPath)) {
      return;
    }
    const rowEntry = getNodeEntrySafe(editor, lastRowPath);
    if (!rowEntry) {
      return;
    }
    const [row] = rowEntry;
    if (!isElementOfType(row, ELEMENT_TR) || !row.autoCreated) {
      return;
    }
    if (isTableRowEmpty(editor, tablePath, tableRowCount - 1)) {
      removeNodes(editor, { at: lastRowPath });
    }
  };

const onCursorChange = (editor: MyEditor) => {
  const atLastRow = withAtLastRow(editor);
  const notAtLastRow = withNotAtLastRow(editor);
  return (selection: Selection): void => {
    if (!isCollapsed(selection)) {
      return;
    }
    const cell = getAboveNodeSafe(editor, { match: isInsideTableCell });
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
