import { useMemo } from 'react';
import { Interpreter, Result, SerializedType } from '@decipad/computer';
import { zip } from '@decipad/utils';
import { BehaviorSubject } from 'rxjs';
import { AggregationKind, DataGroup } from '../types';

const { Column, ResultTransforms } = Result;

type SmartColumnInput = [SerializedType, Result.ColumnLike<Result.Comparable>];

const generateSmartRow = (
  columns: SmartColumnInput[],
  columnNames: string[],
  columnIndex: number,
  aggregationTypes: (AggregationKind | undefined)[],
  subproperties: { value: Result.Comparable; name: string }[],
  parentHighlight$?: BehaviorSubject<boolean>
): DataGroup => {
  const [firstColumn, ...rest] = columns;

  return {
    elementType: 'smartrow',
    children:
      rest.length > 0
        ? [
            generateSmartRow(
              rest,
              columnNames,
              columnIndex + 1,
              aggregationTypes,
              subproperties,
              parentHighlight$
            ),
          ]
        : [],
    column: firstColumn && {
      name: columnNames[columnIndex],
      type: firstColumn[0],
      value: firstColumn[1],
    },
    columnIndex,
    subproperties,
    parentHighlight$,
  };
};

export const group = (
  columnNames: string[],
  columnData: Result.ColumnLike<Result.Comparable>[],
  columnTypes: SerializedType[],
  aggregationTypes: (AggregationKind | undefined)[],
  columnIndex: number,
  subproperties: { value: Result.Comparable; name: string }[],
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
    const newSubproperties = [
      { value, name: columnNames[columnIndex] },
      ...subproperties,
    ];
    const restDataSlice = sortedRestOfColumns.map((column) =>
      ResultTransforms.slice(column, start, end + 1)
    );
    const selfHighlight$ = new BehaviorSubject<boolean>(false);

    const smartRowShouldHide =
      !aggregationTypes ||
      aggregationTypes.filter((aggregationType) => aggregationType).length ===
        0 ||
      (restDataSlice[0] && restDataSlice[0].rowCount <= 1);

    const smartRow =
      !restDataSlice || !restDataSlice[0] || smartRowShouldHide
        ? undefined
        : generateSmartRow(
            zip(restOfTypes, restDataSlice),
            columnNames,
            columnIndex + 1,
            aggregationTypes,
            newSubproperties,
            parentHighlight$
          );
    return {
      elementType: 'group',
      value,
      type,
      children: [
        smartRow,
        ...group(
          columnNames,
          restDataSlice,
          restOfTypes,
          aggregationTypes,
          columnIndex + 1,
          newSubproperties,
          selfHighlight$
        ),
      ].filter(Boolean) as DataGroup[],
      columnIndex,
      selfHighlight$,
      parentHighlight$,
    };
  });
};

export const layoutPowerData = (
  columnNames: string[],
  columns: Interpreter.ResultTable,
  columnTypes: SerializedType[],
  aggregationTypes: (AggregationKind | undefined)[]
) => {
  const sortableColumns = columns.map((column) =>
    Column.fromValues(column as Result.Comparable[])
  );

  return group(
    columnNames,
    sortableColumns,
    columnTypes,
    aggregationTypes,
    0,
    []
  );
};

export const useDataViewLayoutData = (
  columnNames: string[],
  data: Interpreter.ResultTable,
  columnTypes: SerializedType[],
  aggregationTypes: (AggregationKind | undefined)[]
): DataGroup[] => {
  return useMemo(
    () => layoutPowerData(columnNames, data, columnTypes, aggregationTypes),
    [columnNames, data, columnTypes, aggregationTypes]
  );
};
