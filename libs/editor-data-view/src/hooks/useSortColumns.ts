import { Result, Interpreter } from '@decipad/computer';
import { dequal } from 'dequal';
import { useCallback } from 'react';
import type { ColumnNames, Columns, ColumnTypes } from '../types';

interface UseSortColumnsProps {
  sortedColumns: Columns | undefined;
  setSortedColumns: (columns: Columns | undefined) => void;
  availableColumns: Columns | undefined;
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
        if (sortedColumns?.[0]) {
          setSortedColumns(undefined);
        }
        return;
      }

      const columnNames = availableColumns && availableColumns[0];
      const columnTypes = availableColumns && availableColumns[1];
      const columnData = availableColumns && availableColumns[2];

      const sortedColumnNames = Result.ResultTransforms.applyMap(
        Result.Column.fromValues(columnNames),
        columnMap
      ).getData() as ColumnNames;

      const sortedColumnTypes = Result.ResultTransforms.applyMap(
        Result.Column.fromValues(columnTypes as unknown as Result.Comparable[]),
        columnMap
      ).getData() as unknown as ColumnTypes;

      const sortedData = Result.ResultTransforms.applyMap(
        Result.Column.fromValues(columnData as Result.Comparable[]),
        columnMap
      ).getData() as Interpreter.ResultTable;

      if (
        sortedColumns &&
        dequal(sortedColumns[0], sortedColumnNames) &&
        dequal(sortedColumns[1], sortedColumnTypes) &&
        dequal(sortedColumns[2], sortedData)
      ) {
        return;
      }

      setSortedColumns([sortedColumnNames, sortedColumnTypes, sortedData]);
    },
    [availableColumns, setSortedColumns, sortedColumns]
  );
};
