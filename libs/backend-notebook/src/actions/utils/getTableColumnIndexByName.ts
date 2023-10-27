import { TableElement } from '@decipad/editor-types';
import { getNodeString } from '@udecode/plate';
import { notAcceptable } from '@hapi/boom';

export const getTableColumnIndexByName = (
  table: TableElement,
  columnName: string
): number => {
  const headerRow = table.children[1];
  const headerIndex = headerRow.children.findIndex(
    (th) => getNodeString(th) === columnName
  );
  if (headerIndex < 0) {
    throw notAcceptable(
      `That table does not have a column named "${columnName}"`
    );
  }
  return headerIndex;
};
