import { dequal } from 'dequal';
import { useCallback } from 'react';
import { Column as ColumnImpl, Comparable, applyMap } from '@decipad/column';
import { all, filter } from '@decipad/generator-utils';
import { Column } from '../types';

interface UseSortColumnsProps {
  sortedColumns?: Column[];
  availableColumns?: Column[];
  setSortedColumns: (columns: Column[] | undefined) => void;
}

type UseSortColumnsReturn = (columnMap: number[] | undefined) => void;

export const useSortColumns = ({
  sortedColumns,
  setSortedColumns,
  availableColumns,
}: UseSortColumnsProps): UseSortColumnsReturn => {
  return useCallback(
    async (columnMap) => {
      if (!columnMap || !availableColumns) {
        setSortedColumns(undefined);
        return;
      }

      const newSortedColumns = applyMap(
        ColumnImpl.fromValues(availableColumns as Comparable[]),
        columnMap
      );

      const materializedNewSortedColumns = await all(
        filter(newSortedColumns.values(), Boolean)
      );

      if (!dequal(sortedColumns, materializedNewSortedColumns)) {
        setSortedColumns(materializedNewSortedColumns as Column[]);
      }
    },
    [availableColumns, setSortedColumns, sortedColumns]
  );
};
