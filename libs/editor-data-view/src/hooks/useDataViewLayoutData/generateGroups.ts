import { type Result, buildResult } from '@decipad/remote-computer';
import { Value } from '@decipad/language-types';
import { generateHash } from '@decipad/editor-utils';
import { type DataGroup } from '../../types';
import { sliceToGroup } from './sliceToGroup';
import { generateSmartRow } from './generateSmartRow';
import { aggregationExpression as createAggregationExpression } from '../../utils/aggregationExpression';
import type { GenerateGroupsProps } from './types';

export const generateGroups = async ({
  tableName,
  tree,
  previousColumns,
  previousColumnTypes,
  previousFilters,
  valuePath,
  aggregations,
  roundings,
  filters,
  expandedGroups = [],
  parentGroupId = '',
  preventExpansion,
  indent = 0,
}: GenerateGroupsProps): Promise<DataGroup[]> => {
  if (!(tree.value instanceof Value.Tree) || tree.value.children.length === 0) {
    return [];
  }
  // console.log(`>>>>>>>>>>>>>> generateGroups (${indent})`, {
  //   expandedGroups,
  //   tableName,
  //   valuePath,
  //   previousColumnTypes,
  //   previousColumns,
  //   aggregations,
  //   parentGroupId,
  // });
  const nextPreviousColumns = [...previousColumns, tree.value.columns[0]];
  const nextPreviousColumnTypes = [
    ...previousColumnTypes,
    tree.type.columnTypes[0],
  ];
  const nextPreviousFilters = [...previousFilters, filters[0]];
  const dataGroups = await Promise.all(
    tree.value.children.map(async (child) => {
      const groupId = `${parentGroupId}/${await generateHash(child)}`;
      const isExpanded = expandedGroups.includes(groupId);
      const hideSmartRow = child.columns.every(
        (col) => col.aggregation == null
      );
      const type = tree.type.columnTypes[0];
      const subTree: Result.Result<'tree'> = buildResult(
        {
          kind: 'tree',
          columnTypes: tree.type.columnTypes.slice(1),
          columnNames: tree.type.columnNames.slice(1),
        },
        child
      );
      const nextValuePath = valuePath.concat(child.root);

      const aggregationExpression = createAggregationExpression(
        tableName,
        nextPreviousColumns,
        nextPreviousColumnTypes,
        nextValuePath,
        nextPreviousFilters,
        aggregations[0],
        roundings[0],
        filters[0]
      );

      return sliceToGroup({
        tableName,
        tree: subTree,
        groupId,
        type,
        previousColumns: nextPreviousColumns,
        previousColumnTypes: nextPreviousColumnTypes,
        previousFilters: nextPreviousFilters,
        value: child.root,
        valuePath: nextValuePath,
        isExpanded,
        hideSmartRow,
        preventExpansion,
        replicaCount: child.originalCardinality,
        aggregations: aggregations.slice(1),
        roundings: roundings.slice(1),
        filters: filters.slice(1),
        indent,
        expandedGroups,
        aggregationExpression,
        generateGroups,
        generateSmartRow,
      });
    })
  );

  // console.log(`<<<<<<<<<<<<<< generateGroups (${indent})`);

  return dataGroups;
};
