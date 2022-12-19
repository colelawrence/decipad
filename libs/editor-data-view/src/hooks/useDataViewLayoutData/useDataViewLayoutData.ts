import { useEffect, useMemo, useState } from 'react';
import { Interpreter, Result, SerializedType } from '@decipad/computer';
import { AggregationKind, DataGroup } from '../../types';
import { generateGroups } from './generateGroups';
import { generateTotalGroup } from './generateTotalGroup';

const { Column } = Result;

export const layoutPowerData = async (
  columnNames: string[],
  columns: Interpreter.ResultTable,
  columnTypes: SerializedType[],
  aggregationTypes: (AggregationKind | undefined)[],
  expandedGroups: string[] | undefined
): Promise<DataGroup[]> => {
  const sortableColumns = columns.map((column) =>
    Column.fromValues(column as Result.Comparable[])
  );

  const totalGroup = generateTotalGroup({
    columnNames,
    columns: sortableColumns,
    columnTypes,
    aggregationTypes,
  });

  const rootGroups = await generateGroups({
    columnNames,
    columnData: sortableColumns,
    columnTypes,
    aggregationTypes,
    expandedGroups,
    columnIndex: 0,
    subProperties: [],
  });

  return Promise.all([
    ...rootGroups,
    ...(totalGroup != null ? [totalGroup] : []),
  ]);
};

export const useDataViewLayoutData = (
  columnNames: string[],
  data: Interpreter.ResultTable,
  columnTypes: SerializedType[],
  aggregationTypes: (AggregationKind | undefined)[],
  expandedGroups: string[] | undefined
): DataGroup[] => {
  const dataGroups = useMemo(
    () =>
      layoutPowerData(
        columnNames,
        data,
        columnTypes,
        aggregationTypes,
        expandedGroups
      ),
    [aggregationTypes, expandedGroups, columnNames, columnTypes, data]
  );

  const [resolvedDataGroups, setResolvedDataGroups] = useState<DataGroup[]>([]);

  useEffect(() => {
    (async () => {
      setResolvedDataGroups(await dataGroups);
    })();
  }, [dataGroups]);

  return resolvedDataGroups;
};
