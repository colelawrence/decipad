import type {
  MyEditor,
  TableElement,
  TableHeaderElement,
} from '@decipad/editor-types';
import type { TNodeEntry } from '@udecode/plate-common';
import { getNode } from '@udecode/plate-common';
import { getNodeString } from '../../utils/getNodeString';

export const findColumn = (
  editor: MyEditor,
  tableEntry: TNodeEntry<TableElement>,
  columnName: string
): TNodeEntry<TableHeaderElement> | null => {
  const [table, tablePath] = tableEntry;
  const headerIndex = table.children[1].children.findIndex(
    (th) => getNodeString(th) === columnName
  );
  const columnPath = [...tablePath, 1, headerIndex];
  const column: TableHeaderElement | null =
    headerIndex >= 0 ? getNode(editor, columnPath) : null;
  return column ? [column, columnPath] : null;
};
