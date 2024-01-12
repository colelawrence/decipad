import { editorStatsStore } from '@decipad/react-contexts';
import { AggregationKind, DataGroup, VirtualColumn } from '../../types';
import { generateGroups } from './generateGroups';
import { generateSmartRow } from './generateSmartRow';

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
    generateSmartRow({
      columns,
      columnIndex: 0,
      aggregationTypes,
      previousColumns: [],
      global: true,
      rotate: false,
    });

  const result = await Promise.all([
    ...rootGroups,
    ...(totalGroup && !!aggregationTypes.filter((f) => f).length
      ? [totalGroup]
      : []),
  ]);
  const elapsedMs = Date.now() - start;
  editorStatsStore
    .getState()
    .pushDataViewStat({ computeLayoutElapsedTimeMs: elapsedMs });

  return result;
};
