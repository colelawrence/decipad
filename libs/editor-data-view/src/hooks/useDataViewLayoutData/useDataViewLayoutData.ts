import { useMemo } from 'react';
import { useResolved } from '@decipad/react-utils';
import { useResult } from '@decipad/react-contexts';
import { type Result, Value } from '@decipad/remote-computer';
import { type DataViewFilter } from '@decipad/editor-types';
import type { AggregationKind, Column, DataGroup } from '../../types';
import { layoutPowerData } from './layoutPowerData';

interface UseDataViewLayoutDataProps {
  blockId: string;
  tableName: string;
  columns: Column[];
  aggregationTypes: Array<AggregationKind | undefined>;
  roundings: Array<string | undefined>;
  filters: Array<DataViewFilter | undefined>;
  expandedGroups: string[] | undefined;
  includeTotal?: boolean;
  preventExpansion: boolean;
}

export const useDataViewLayoutData = ({
  blockId,
  tableName,
  columns: _columns,
  aggregationTypes,
  roundings,
  filters,
  expandedGroups,
  includeTotal = true,
  preventExpansion = false,
}: UseDataViewLayoutDataProps): DataGroup[] | undefined => {
  const treeIdentResult = useResult(`${blockId}_shadow`);

  return useResolved(
    useMemo(() => {
      if (!treeIdentResult || treeIdentResult.type !== 'computer-result') {
        return undefined;
      }
      const tree = treeIdentResult.result;
      if (tree.type.kind !== 'tree' || !(tree.value instanceof Value.Tree)) {
        return undefined;
      }
      return layoutPowerData({
        tableName,
        tree: tree as Result.Result<'tree'>,
        aggregationTypes,
        roundings,
        filters,
        expandedGroups,
        includeTotal,
        preventExpansion,
      });
    }, [
      aggregationTypes,
      expandedGroups,
      includeTotal,
      preventExpansion,
      roundings,
      filters,
      tableName,
      treeIdentResult,
    ])
  );
};
