import { Result, Interpreter } from '@decipad/computer';
import { dequal } from 'dequal';
import { useCallback } from 'react';
import type { ColumnNames, Columns, ColumnTypes } from '../types';

interface UseSortColumnsProps {
  columnNames: ColumnNames | undefined;
  columnTypes: ColumnTypes | undefined;
  data: Interpreter.ResultTable | undefined;
  sortedColumns: Columns | undefined;
  setSortedColumns: (columns: Columns | undefined) => void;
}

type UseSortColumnsReturn = (columnMap: number[] | undefined) => void;

export const useSortColumns = ({
  columnNames,
  columnTypes,
  data,
  sortedColumns,
  setSortedColumns,
}: UseSortColumnsProps): UseSortColumnsReturn => {
  return useCallback(
    (columnMap) => {
      if (!columnMap || !columnNames || !columnTypes || !data) {
        if (sortedColumns?.[0]) {
          setSortedColumns(undefined);
        }
        return;
      }
      const sortedColumnNames = Result.ResultTransforms.applyMap(
        Result.Column.fromValues(columnNames),
        columnMap
      ).getData() as ColumnNames;

      const sortedColumnTypes = Result.ResultTransforms.applyMap(
        Result.Column.fromValues(columnTypes as unknown as Result.Comparable[]),
        columnMap
      ).getData() as unknown as ColumnTypes;

      const sortedData = Result.ResultTransforms.applyMap(
        Result.Column.fromValues(data as Result.Comparable[]),
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
    [columnNames, columnTypes, data, setSortedColumns, sortedColumns]
  );
};
