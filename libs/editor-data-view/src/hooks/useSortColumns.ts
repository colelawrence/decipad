import { Result } from '@decipad/computer';
import { dequal } from 'dequal';
import { useCallback } from 'react';
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
    (columnMap) => {
      if (!columnMap || !availableColumns) {
        setSortedColumns(undefined);
        return;
      }

      const newSortedColumns = Result.ResultTransforms.applyMap(
        Result.Column.fromValues(
          availableColumns as unknown as Result.Comparable[]
        ),
        columnMap
      )
        .getData()
        .filter(Boolean) as unknown as typeof availableColumns;

      if (!dequal(sortedColumns, newSortedColumns)) {
        setSortedColumns(newSortedColumns);
      }
    },
    [availableColumns, setSortedColumns, sortedColumns]
  );
};
