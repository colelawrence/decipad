import { useEffect, useState } from 'react';
import { Interpreter, Result, SerializedType } from '@decipad/computer';
import { zip } from '@decipad/utils';
import { BehaviorSubject } from 'rxjs';
import { generateHash } from '@decipad/editor-utils';
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

export const group = async (
  columnNames: string[],
  columnData: Result.ColumnLike<Result.Comparable>[],
  columnTypes: SerializedType[],
  aggregationTypes: (AggregationKind | undefined)[],
  collapsedGroups: string[] | undefined,
  columnIndex: number,
  subproperties: { value: Result.Comparable; name: string }[],
  parentHighlight$?: BehaviorSubject<boolean>,
  parentGroupId?: string
): Promise<DataGroup[]> => {
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

  const mappedSlicePromises = slices.map(
    async ([start, end]): Promise<DataGroup> => {
      const value = sortedFirstColumn.atIndex(start);

      const generatedHash = await generateHash(value);
      const groupId = parentGroupId
        ? `${parentGroupId}/${generatedHash}`
        : generatedHash;

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

      const newGroup = await group(
        columnNames,
        restDataSlice,
        restOfTypes,
        aggregationTypes,
        collapsedGroups,
        columnIndex + 1,
        newSubproperties,
        selfHighlight$,
        groupId
      );

      const includesGroupId =
        collapsedGroups && collapsedGroups.includes(groupId);

      const smartRowHasLength = smartRow && smartRow.children.length >= 1;

      const children = !includesGroupId
        ? ([smartRowHasLength ? smartRow : undefined, ...newGroup].filter(
            Boolean
          ) as DataGroup[])
        : smartRow
        ? [smartRow]
        : [];

      return {
        elementType: 'group',
        id: groupId,
        value,
        type,
        children,
        collapsible: newGroup.length > 1,
        selfHighlight$,
        parentHighlight$,
        columnIndex,
      };
    }
  );

  return Promise.all(mappedSlicePromises);
};

export const layoutPowerData = async (
  columnNames: string[],
  columns: Interpreter.ResultTable,
  columnTypes: SerializedType[],
  aggregationTypes: (AggregationKind | undefined)[],
  collapsedGroups: string[] | undefined
): Promise<DataGroup[]> => {
  const sortableColumns = columns.map((column) =>
    Column.fromValues(column as Result.Comparable[])
  );

  return group(
    columnNames,
    sortableColumns,
    columnTypes,
    aggregationTypes,
    collapsedGroups,
    0,
    []
  );
};

export const useDataViewLayoutData = (
  columnNames: string[],
  data: Interpreter.ResultTable,
  columnTypes: SerializedType[],
  aggregationTypes: (AggregationKind | undefined)[],
  collapsedGroups: string[] | undefined
): DataGroup[] => {
  const [dataGroups, setDataGroups] = useState<DataGroup[]>([]);

  useEffect(() => {
    (async () => {
      setDataGroups(
        await layoutPowerData(
          columnNames,
          data,
          columnTypes,
          aggregationTypes,
          collapsedGroups
        )
      );
    })();
  }, [aggregationTypes, collapsedGroups, columnNames, columnTypes, data]);

  return dataGroups;
};
