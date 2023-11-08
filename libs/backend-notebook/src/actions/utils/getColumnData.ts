import { TableElement } from '@decipad/editor-types';
import { getNodeString } from '@udecode/plate';

export const getColumnData = (
  table: TableElement,
  columnName: string
): string[] => {
  const headerIndex = table.children[1].children.findIndex(
    (th) => getNodeString(th) === columnName
  );
  if (headerIndex >= 0) {
    return table.children
      .slice(2)
      .map((tr) => getNodeString(tr.children[headerIndex] ?? { text: '' }));
  }
  return [];
};
