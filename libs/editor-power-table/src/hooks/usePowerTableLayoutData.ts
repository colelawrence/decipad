import { useMemo } from 'react';
import { Interpreter, SerializedType, Result } from '@decipad/computer';
import { PowerTableDataLayout, RowLayout } from '../types';

const { Column, ResultTransforms } = Result;

const sumRowSpan = (sum: number, row: RowLayout): number => {
  return sum + row.rowSpan;
};

export const layoutPower = (
  columnData: Result.ColumnLike<Result.Comparable>[],
  columnTypes: SerializedType[]
): PowerTableDataLayout => {
  if (columnData.length !== columnTypes.length) {
    throw new Error(
      `number of columns differs from number of types: ${columnData.length} and ${columnTypes.length}`
    );
  }
  if (columnData.length < 1) {
    return [];
  }
  const [firstColumn, ...restOfColumns] = columnData;
  const [type, ...restOfTypes] = columnTypes;

  const sortMap = ResultTransforms.sortMap(firstColumn);
  const sortedColumn = ResultTransforms.applyMap(firstColumn, sortMap);
  const slices = ResultTransforms.contiguousSlices(sortedColumn);
  const sortedRestOfColumns = restOfColumns.map((column) =>
    ResultTransforms.applyMap(column, sortMap)
  );

  return slices.map(([start, end]): RowLayout => {
    const value = sortedColumn.atIndex(start);
    const restDataSlice = sortedRestOfColumns.map((column) =>
      ResultTransforms.slice(column, start, end + 1)
    );
    const rest = layoutPower(restDataSlice, restOfTypes);
    return {
      value,
      type,
      rest,
      rowSpan: 1 + rest.reduce(sumRowSpan, 0),
    };
  });
};

export const layoutPowerData = (
  columns: Interpreter.ResultTable,
  columnTypes: SerializedType[]
) => {
  const columnColumns = columns.map(
    (column) => new Column<Result.Comparable>(column as Result.Comparable[])
  );
  return layoutPower(columnColumns, columnTypes);
};

export const usePowerTableLayoutData = (
  data: Interpreter.ResultTable,
  columnTypes: SerializedType[]
): PowerTableDataLayout => {
  return useMemo(() => layoutPowerData(data, columnTypes), [data, columnTypes]);
};
