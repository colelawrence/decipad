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

  return Promise.all([...rootGroups, ...(totalGroup ? [totalGroup] : [])]);
};
