import { useMemo } from 'react';
import { Interpreter, SerializedType, Result } from '@decipad/computer';
import { zip } from '@decipad/utils';
import { BehaviorSubject } from 'rxjs';
import { DataGroup } from '../types';

const { Column, ResultTransforms } = Result;

type SmartColumnInput = [SerializedType, Result.ColumnLike<Result.Comparable>];

const smartRow = (
  columns: SmartColumnInput[],
  columnIndex: number,
  parentHighlight$?: BehaviorSubject<boolean>
): DataGroup => {
  const [column, ...rest] = columns;
  return {
    elementType: 'smartrow',
    children:
      rest.length > 0
        ? [smartRow(rest, columnIndex + 1, parentHighlight$)]
        : [],
    column: column && {
      type: column[0],
      value: column[1],
    },
    columnIndex,
    parentHighlight$,
  };
};

export const group = (
  columnData: Result.ColumnLike<Result.Comparable>[],
  columnTypes: SerializedType[],
  columnIndex: number,
  parentHighlight$?: BehaviorSubject<boolean>
): DataGroup[] => {
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
  const sortedFirstColumn = ResultTransforms.applyMap(firstColumn, sortMap);
  const sortedRestOfColumns = restOfColumns.map((column) =>
    ResultTransforms.applyMap(column, sortMap)
  );
  const slices = ResultTransforms.contiguousSlices(sortedFirstColumn);

  return slices.map(([start, end]): DataGroup => {
    const value = sortedFirstColumn.atIndex(start);
    const restDataSlice = sortedRestOfColumns.map((column) =>
      ResultTransforms.slice(column, start, end + 1)
    );
    const selfHighlight$ = new BehaviorSubject<boolean>(false);

    const smartRowShouldHide =
      restDataSlice[0] && restDataSlice[0].rowCount <= 1;

    const sRow =
      !restDataSlice || !restDataSlice[0] || smartRowShouldHide
        ? undefined
        : smartRow(
            zip(restOfTypes, restDataSlice),
            columnIndex + 1,
            selfHighlight$
          );

    return {
      elementType: 'group',
      value,
      type,
      children: [
        sRow,
        ...group(restDataSlice, restOfTypes, columnIndex + 1, selfHighlight$),
      ].filter(Boolean) as DataGroup[],
      columnIndex,
      selfHighlight$,
      parentHighlight$,
    };
  });
};

export const layoutPowerData = (
  columns: Interpreter.ResultTable,
  columnTypes: SerializedType[]
) => {
  const sortableColumns = columns.map((column) =>
    Column.fromValues(column as Result.Comparable[])
  );
  return group(sortableColumns, columnTypes, 0);
};

export const useDataViewLayoutData = (
  data: Interpreter.ResultTable,
  columnTypes: SerializedType[]
): DataGroup[] => {
  return useMemo(() => layoutPowerData(data, columnTypes), [data, columnTypes]);
};
