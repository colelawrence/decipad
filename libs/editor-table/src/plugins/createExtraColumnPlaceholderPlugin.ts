import { createOnCursorChangePluginFactory } from '@decipad/editor-plugins';
import { isCollapsed } from '@udecode/plate';
import { Editor, Node, Transforms, Selection, Path, NodeEntry } from 'slate';
import {
  ELEMENT_TD,
  ELEMENT_TH,
  isElement,
  TableHeaderElement,
} from '@decipad/editor-types';
import { nanoid } from 'nanoid';
import { getTableColumnCount } from '../utils/getTableColumnCount';
import { isTableColumnEmpty } from '../utils/isTableColumnEmpty';

const isInsideTableCell = (node: Node): boolean => {
  return (
    isElement(node) && (node.type === ELEMENT_TD || node.type === ELEMENT_TH)
  );
};

const withAtLastColumn =
  (editor: Editor) => (tablePath: Path, tableColumnCount: number) => {
    // user is at the last column: add a column
    const newThPath = [...tablePath, 1, tableColumnCount];
    const newTh: TableHeaderElement = {
      id: nanoid(),
      type: ELEMENT_TH,
      cellType: { kind: 'string' },
      autoCreated: true,
      children: [{ text: `Column${tableColumnCount + 1}` }],
    };
    Transforms.insertNodes(editor, newTh, { at: newThPath });
  };

const withNotAtLastColumn =
  (editor: Editor) => (tablePath: Path, tableColumnCount: number) => {
    const tableColumnIndex = tableColumnCount - 1;
    const lastHeaderPath = [...tablePath, 1, tableColumnIndex];
    if (!Editor.hasPath(editor, lastHeaderPath)) {
      return;
    }
    const [headerEntry] = Editor.node(
      editor,
      lastHeaderPath
    ) as NodeEntry<TableHeaderElement>;
    if (!headerEntry.autoCreated) {
      return;
    }
    if (isTableColumnEmpty(editor, tablePath, tableColumnIndex)) {
      Transforms.removeNodes(editor, { at: lastHeaderPath });
    }
  };

const onCursorChange = (editor: Editor) => {
  const atLastColumn = withAtLastColumn(editor);
  const notAtLastColumn = withNotAtLastColumn(editor);
  return (selection: Selection): void => {
    if (!isCollapsed(selection)) {
      return;
    }
    const cell = Editor.above(editor, { match: isInsideTableCell });
    if (!cell) {
      return;
    }
    // is the user at the last column?
    const [, cellPath] = cell;
    const tablePath = cellPath.slice(0, cellPath.length - 2);
    if (!tablePath.length) {
      return;
    }
    const tableColumnCount = getTableColumnCount(editor, tablePath);
    if (tableColumnCount == null) {
      return;
    }
    if (cellPath[cellPath.length - 1] < tableColumnCount - 2) {
      return notAtLastColumn(tablePath, tableColumnCount);
    }
    if (cellPath[cellPath.length - 1] === tableColumnCount - 1) {
      atLastColumn(tablePath, tableColumnCount);
    }
  };
};

export const createExtraColumnPlaceholderPlugin =
  createOnCursorChangePluginFactory(
    'CREATE_EXTRA_COLUMN_PLACEHOLDER_PLUGIN',
    onCursorChange
  );
