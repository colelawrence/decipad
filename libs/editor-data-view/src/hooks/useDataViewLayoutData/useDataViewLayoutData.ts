import { useEffect, useMemo, useState } from 'react';
import { Interpreter, Result, SerializedType } from '@decipad/computer';
import { AggregationKind, DataGroup } from '../../types';
import { generateGroups } from './generateGroups';

const { Column } = Result;

export const layoutPowerData = (
  columnNames: string[],
  columns: Interpreter.ResultTable,
  columnTypes: SerializedType[],
  aggregationTypes: (AggregationKind | undefined)[],
  collapsedGroups: string[] | undefined
): Promise<DataGroup[]> => {
  const sortableColumns = columns.map((column) =>
    Column.fromValues(column as Result.Comparable[])
  );

  return generateGroups({
    columnNames,
    columnData: sortableColumns,
    columnTypes,
    aggregationTypes,
    collapsedGroups,
    columnIndex: 0,
    subProperties: [],
  });
};

export const useDataViewLayoutData = (
  columnNames: string[],
  data: Interpreter.ResultTable,
  columnTypes: SerializedType[],
  aggregationTypes: (AggregationKind | undefined)[],
  collapsedGroups: string[] | undefined
): DataGroup[] => {
  const dataGroups = useMemo(
    () =>
      layoutPowerData(
        columnNames,
        data,
        columnTypes,
        aggregationTypes,
        collapsedGroups
      ),
    [aggregationTypes, collapsedGroups, columnNames, columnTypes, data]
  );

  const [resolvedDataGroups, setResolvedDataGroups] = useState<DataGroup[]>([]);

  useEffect(() => {
    (async () => {
      setResolvedDataGroups(await dataGroups);
    })();
  }, [dataGroups]);

  return resolvedDataGroups;
};
