/* eslint-disable react-hooks/exhaustive-deps */
import { DependencyList, useMemo } from 'react';
import { useResolved } from '@decipad/react-utils';
import { type Result } from '@decipad/language-interfaces';
import { Value } from '@decipad/language-types';
import { type DataViewFilter } from '@decipad/editor-types';
import type { AggregationKind, Column, DataGroup } from '../../types';
import { layoutPowerData } from './layoutPowerData';
import { useComputer } from '@decipad/editor-hooks';

interface UseDataViewLayoutDataProps {
  blockId: string;
  tableName: string;
  columns: Column[];
  aggregationTypes: Array<AggregationKind | undefined>;
  roundings: Array<string | undefined>;
  filters: Array<DataViewFilter | undefined>;
  expandedGroups: string[] | boolean | undefined;
  includeTotal?: boolean;
  preventExpansion: boolean;
  deps?: string;
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
