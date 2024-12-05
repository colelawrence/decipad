import { useMemo } from 'react';
import { useResolved } from '@decipad/react-utils';
import { type Result } from '@decipad/language-interfaces';
import { Value } from '@decipad/language-types';
import { type TimeSeriesFilter } from '@decipad/editor-types';
import type { AggregationKind, Column, DataGroup } from '../../types';
import { layoutPowerData } from './layoutPowerData';
import { useComputer } from '@decipad/editor-hooks';

interface UseTimeSeriesLayoutDataProps {
  blockId: string;
  tableName: string;
  columns: Column[];
  aggregationTypes: Array<AggregationKind | undefined>;
  roundings: Array<string | undefined>;
  filters: Array<TimeSeriesFilter | undefined>;
  expandedGroups: string[] | undefined;
  includeTotal?: boolean;
  preventExpansion: boolean;
}

export const useTimeSeriesLayoutData = ({
  blockId,
  tableName,
  columns: _columns,
  aggregationTypes,
  roundings,
  filters,
  expandedGroups,
  includeTotal = true,
  preventExpansion = false,
}: UseTimeSeriesLayoutDataProps): DataGroup[] | undefined => {
  const treeIdentResult = useComputer().getBlockIdResult$.use(
    `${blockId}_shadow`
  );

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
