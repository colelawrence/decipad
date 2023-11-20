import { TableElement } from '@decipad/editor-types';
import { notAcceptable } from '@hapi/boom';
import { getNodeString } from '../../utils/getNodeString';

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
