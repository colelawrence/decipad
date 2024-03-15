import { useMemo } from 'react';
import { useResolved } from '@decipad/react-utils';
import { Column as ColumnImpl } from '@decipad/column';
import { AggregationKind, Column, DataGroup } from '../../types';
import { layoutPowerData } from './layoutPowerData';
import { useReplacingColumns } from './useReplacingColumns';
import { Result } from '@decipad/remote-computer';
import { DataViewFilter } from '@decipad/editor-types';

interface UseDataViewLayoutDataProps {
  tableName: string;
  columns: Column[];
  aggregationTypes: Array<AggregationKind | undefined>;
  roundings: Array<string | undefined>;
  expandedGroups: string[] | undefined;
  includeTotal?: boolean;
  preventExpansion: boolean;
  rotate: boolean;
  filters: Array<DataViewFilter | undefined>;
}

export const useDataViewLayoutData = ({
  tableName,
  columns: _columns,
  aggregationTypes,
  roundings,
  expandedGroups,
  includeTotal = true,
  preventExpansion = false,
  rotate,
  filters,
}: UseDataViewLayoutDataProps): DataGroup[] | undefined => {
  const columns = useReplacingColumns({
    tableName,
    columns: _columns,
    roundings,
    filters,
  });

  return useResolved(
    useMemo(
      () =>
        layoutPowerData({
          columns: columns.map((column) => ({
            ...column,
            value: ColumnImpl.fromValues(
              column.value as Result.OneMaterializedResult[]
            ),
          })),
          aggregationTypes,
          expandedGroups,
          includeTotal,
          preventExpansion,
          rotate,
        }),
      [
        aggregationTypes,
        columns,
        expandedGroups,
        includeTotal,
        preventExpansion,
        rotate,
      ]
    )
  );
};
