import { editorStatsStore } from '@decipad/react-contexts';
import { AggregationKind, DataGroup, VirtualColumn } from '../../types';
import { generateGroups } from './generateGroups';
import { generateTotalGroup } from './generateTotalGroup';

interface LayoutPowerDataProps {
  columns: VirtualColumn[];
  aggregationTypes: Array<AggregationKind | undefined>;
  expandedGroups: string[] | undefined;
  includeTotal?: boolean;
  preventExpansion: boolean;
  rotate: boolean;
}

export const layoutPowerData = async ({
  columns,
  aggregationTypes,
  expandedGroups,
  includeTotal = true,
  preventExpansion = false,
  rotate,
}: LayoutPowerDataProps): Promise<DataGroup[]> => {
  const start = Date.now();
  const rootGroups = await generateGroups({
    columns,
    aggregationTypes,
    expandedGroups,
    columnIndex: 0,
    previousColumns: [],
    preventExpansion,
    rotate,
  });

  const totalGroup =
    includeTotal &&
    generateTotalGroup({
      columns,
      aggregationTypes,
    });

  const result = await Promise.all([
    ...rootGroups,
    ...(totalGroup ? [totalGroup] : []),
  ]);
  const elapsedMs = Date.now() - start;
  editorStatsStore
    .getState()
    .pushDataViewStat({ computeLayoutElapsedTimeMs: elapsedMs });

  return result;
};
