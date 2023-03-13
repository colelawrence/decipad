import { AggregationKind, DataGroup, VirtualColumn } from '../../types';
import { generateGroups } from './generateGroups';
import { generateTotalGroup } from './generateTotalGroup';

interface LayoutPowerDataProps {
  columns: VirtualColumn[];
  aggregationTypes: Array<AggregationKind | undefined>;
  expandedGroups: string[] | undefined;
}

export const layoutPowerData = async ({
  columns,
  aggregationTypes,
  expandedGroups,
}: LayoutPowerDataProps): Promise<DataGroup[]> => {
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
