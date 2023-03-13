import { Result } from '@decipad/computer';
import { useEffect, useMemo, useState } from 'react';
import { AggregationKind, Column, DataGroup } from '../../types';
import { layoutPowerData } from './layoutPowerData';
import { useReplacingColumns } from './useReplacingColumns';

interface UseDataViewLayoutDataProps {
  tableName: string;
  columns: Column[];
  aggregationTypes: Array<AggregationKind | undefined>;
  roundings: Array<string | undefined>;
  expandedGroups: string[] | undefined;
}

export const useDataViewLayoutData = ({
  tableName,
  columns: _columns,
  aggregationTypes,
  roundings,
  expandedGroups,
}: UseDataViewLayoutDataProps): DataGroup[] => {
  const columns = useReplacingColumns({
    tableName,
    columns: _columns,
    roundings,
  });

  const dataGroups = useMemo(
    () =>
      layoutPowerData({
        columns: columns.map((column) => ({
          ...column,
          value: Result.Column.fromValues(column.value as Result.Comparable[]),
        })),
        aggregationTypes,
        expandedGroups,
      }),
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
