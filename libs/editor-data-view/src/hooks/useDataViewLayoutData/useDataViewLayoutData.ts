import { Result } from '@decipad/computer';
import { useEffect, useMemo, useState } from 'react';
import { AggregationKind, Column, DataGroup, VirtualColumn } from '../../types';
import { generateGroups } from './generateGroups';
import { generateTotalGroup } from './generateTotalGroup';

export const layoutPowerData = async (
  columns: VirtualColumn[],
  aggregationTypes: (AggregationKind | undefined)[],
  expandedGroups: string[] | undefined
): Promise<DataGroup[]> => {
  const rootGroups = await generateGroups({
    columns,
    aggregationTypes,
    expandedGroups,
    columnIndex: 0,
    previousColumns: [],
  });

  const totalGroup = generateTotalGroup({
    columns,
    aggregationTypes,
  });

  return Promise.all([
    ...rootGroups,
    ...(totalGroup != null ? [totalGroup] : []),
  ]);
};

export const useDataViewLayoutData = (
  columns: Column[],
  aggregationTypes: (AggregationKind | undefined)[],
  expandedGroups: string[] | undefined
): DataGroup[] => {
  const dataGroups = useMemo(
    () =>
      layoutPowerData(
        columns.map((column) => ({
          ...column,
          value: Result.Column.fromValues(column.value as Result.Comparable[]),
        })),
        aggregationTypes,
        expandedGroups
      ),
    [aggregationTypes, columns, expandedGroups]
  );

  const [resolvedDataGroups, setResolvedDataGroups] = useState<DataGroup[]>([]);

  useEffect(() => {
    (async () => {
      setResolvedDataGroups(await dataGroups);
    })();
  }, [dataGroups]);

  return resolvedDataGroups;
};
