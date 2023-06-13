import { Column as ColumnImpl, Comparable, applyMap } from '@decipad/column';
import { all, filter } from '@decipad/generator-utils';
import { Column } from '../types';

export const sortColumns = async (
  availableColumns: Column[] | undefined,
  columnMap?: number[]
): Promise<Column[] | undefined> => {
  if (!columnMap || !availableColumns) {
    return undefined;
  }

  const sortedColumns = applyMap(
    ColumnImpl.fromValues(availableColumns as Comparable[]),
    columnMap
  );

  return all(filter(sortedColumns.values(), Boolean)) as Promise<Column[]>;
};
