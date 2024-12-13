import {
  type Value,
  type SerializedType,
  type Result,
} from '@decipad/remote-computer';
import type { DataViewFilter } from '@decipad/editor-types';
import { type DataGroup } from '../../types';
import { type GenerateGroups } from './types';
import { type GenerateSmartRow } from './generateSmartRow';

interface SliceToGroupProps {
  tableName: string;
  tree: Result.Result<'tree'>;
  isExpanded: boolean;
  value: Result.OneResult;
  type: SerializedType;
  previousColumns: Array<Value.TreeColumn>;
  previousColumnTypes: Array<SerializedType>;
  previousFilters: Array<DataViewFilter | undefined>;
  valuePath: Array<Result.OneResult>;
  aggregations: Array<string | undefined>;
  roundings: Array<string | undefined>;
  filters: Array<DataViewFilter | undefined>;
  hideSmartRow: boolean;
  groupId: string;
  preventExpansion: boolean;
  indent?: number;
  expandedGroups?: string[] | boolean;
  aggregationExpression?: string;
  generateGroups: GenerateGroups;
  generateSmartRow: GenerateSmartRow;
}

export const sliceToGroup = async ({
  tableName,
  tree,
  isExpanded,
  value,
  type,
  previousColumns,
  previousColumnTypes,
  previousFilters,
  valuePath,
  aggregations,
  roundings,
  filters,
  hideSmartRow,
  groupId,
  preventExpansion,
  indent = 0,
  expandedGroups,
  aggregationExpression,
  generateGroups,
  generateSmartRow,
}: SliceToGroupProps): Promise<DataGroup> => {
  const newGroups = await generateGroups({
    tableName,
    tree,
    previousColumns,
    previousColumnTypes,
    previousFilters,
    valuePath,
    parentGroupId: groupId,
    preventExpansion,
    aggregations,
    roundings,
    filters,
    indent: indent + 1,
    expandedGroups,
  });

  const collapsible = newGroups.length > 1;

  const smartRow =
    !hideSmartRow && collapsible && tree.value.columns.length > 0
      ? generateSmartRow({
          aggregation: tree.value.columns[0].aggregation,
          tableName,
          columnTypes: tree.type.columnTypes,
          columns: tree.value.columns,
          previousColumns,
          previousColumnTypes,
          previousFilters,
          valuePath,
          aggregations,
          roundings,
          filters,
          indent,
        })
      : null;

  const children = [
    smartRow,
    ...(isExpanded || !collapsible ? newGroups : []),
  ].filter(Boolean) as DataGroup[];

  const aggregationResult =
    indent > 0
      ? previousColumns[previousColumns.length - 1]?.aggregation
      : undefined;

  return {
    elementType: 'group',
    id: groupId,
    value,
    type,
    children,
    collapsible,
    aggregationResult,
    aggregationExpression,
  };
};
