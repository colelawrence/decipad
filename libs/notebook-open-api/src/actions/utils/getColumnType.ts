import { TableCellType, TableElement } from '@decipad/editor-types';
import { inferColumn } from '@decipad/parse';
import { RemoteComputer } from '@decipad/remote-computer';
import { getColumnData } from './getColumnData';
import { PromiseOrType } from '@decipad/utils';
import { getNodeString } from '../../utils/getNodeString';

export const getColumnType = (
  computer: RemoteComputer,
  table: TableElement,
  columnName: string
): PromiseOrType<TableCellType> => {
  const headerIndex = table.children[1].children.findIndex(
    (th) => getNodeString(th) === columnName
  );
  if (headerIndex < 0) {
    return {
      kind: 'anything',
    };
  }
  const data = getColumnData(table, columnName);
  return inferColumn(computer, data) as Promise<TableCellType>;
};
