import { type Result } from '@decipad/remote-computer';
import { Value } from '@decipad/language-types';
import { type DataViewFilter } from '@decipad/editor-types';
import type { AggregationKind, DataGroup } from '../../types';
import { generateGroups } from './generateGroups';
import { generateSmartRow } from './generateSmartRow';
import { identity } from '@decipad/utils';

interface LayoutPowerDataProps {
  tableName: string;
  tree: Result.Result<'tree'>;
  aggregationTypes: Array<AggregationKind | undefined>;
  roundings: Array<string | undefined>;
  filters: Array<DataViewFilter | undefined>;
  expandedGroups: string[] | undefined;
  includeTotal?: boolean;
  preventExpansion: boolean;
}

export const layoutPowerData = async ({
  tableName,
  tree,
  aggregationTypes,
  roundings,
  filters,
  expandedGroups,
  includeTotal = true,
  preventExpansion = false,
}: LayoutPowerDataProps): Promise<DataGroup[]> => {
  if (!(tree.value instanceof Value.Tree)) {
    console.error('Expected tree value', tree);
    throw new Error('Expected tree value');
  }
  const rootGroups = await generateGroups({
    tableName,
    tree,
    expandedGroups,
    preventExpansion,
    valuePath: [],
    previousColumns: [],
    previousColumnTypes: [],
    previousFilters: [],
    aggregations: aggregationTypes,
    roundings,
    filters,
  });

  const totalGroup =
    includeTotal &&
    tree.value.columns.length > 0 &&
    generateSmartRow({
      aggregation: tree.value.columns[0].aggregation,
      tableName,
      columnTypes: tree.type.columnTypes,
      columns: tree.value.columns,
      global: true,
      valuePath: [],
      previousColumns: [],
      previousColumnTypes: [],
      previousFilters: [],
      aggregations: aggregationTypes,
      roundings,
      filters,
      indent: -Infinity,
    });

  const result = [
    ...rootGroups,
    ...(totalGroup && !!aggregationTypes.filter(identity).length
      ? [totalGroup]
      : []),
  ];

  return result;
};
