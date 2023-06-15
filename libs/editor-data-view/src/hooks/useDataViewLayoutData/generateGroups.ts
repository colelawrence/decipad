import { BehaviorSubject } from 'rxjs';
import { generateHash } from '@decipad/editor-utils';
import {
  Comparable,
  applyMap,
  contiguousSlices,
  slice,
  sortMap,
} from '@decipad/column';
import { compare } from '@decipad/universal-compare';
import {
  AggregationKind,
  DataGroup,
  PreviousColumns,
  VirtualColumn,
} from '../../types';
import { generateSmartRow, GenerateSmartRowProps } from './generateSmartRow';
import { sliceToGroup } from './sliceToGroup';

export interface GenerateGroupsProps {
  columns: VirtualColumn[];
  columnIndex: number;
  previousColumns: PreviousColumns;
  parentGroupId?: string;
  parentHighlight$?: BehaviorSubject<boolean>;
  preventExpansion: boolean;
  rotate: boolean;
}

export type GenerateSubSmartRowProps = Omit<
  GenerateSmartRowProps,
  'aggregationTypes'
>;

export type GenerateSubSmartRow = (
  props: GenerateSubSmartRowProps
) => DataGroup;

export type GenerateGroups = (
  props: GenerateGroupsProps
) => Promise<DataGroup[]>;

export const generateGroups = async ({
  columns,
  aggregationTypes,
  expandedGroups = [],
  columnIndex,
  previousColumns,
  parentHighlight$,
  parentGroupId,
  preventExpansion,
  rotate,
}: GenerateGroupsProps & {
  aggregationTypes: (AggregationKind | undefined)[];
  expandedGroups?: string[];
}): Promise<DataGroup[]> => {
  if (columns.length < 1) {
    return [];
  }
  const [firstColumn, ...restOfColumns] = columns;

  const map = await sortMap<Comparable>(firstColumn.value, compare);
  const sortedFirstColumn = applyMap(firstColumn.value, map);
  const sortedRestOfColumns: VirtualColumn[] = restOfColumns.map((column) => ({
    ...column,
    value: applyMap(column.value, map),
  }));
  const slices = await contiguousSlices<Comparable>(sortedFirstColumn, compare);

  const subGenerateGroups: GenerateGroups = (props) =>
    generateGroups({ ...props, aggregationTypes, expandedGroups });

  const subGenerateSmartRow: GenerateSubSmartRow = (props) =>
    generateSmartRow({ ...props, aggregationTypes });

  const groups = await Promise.all(
    slices.map(async ([start, end]) => {
      const value = await sortedFirstColumn.atIndex(start);
      const generatedHash = await generateHash(value);
      const groupId = parentGroupId
        ? `${parentGroupId}/${generatedHash}`
        : generatedHash;

      const isExpanded = expandedGroups.includes(groupId);

      const groupColumns: VirtualColumn[] = sortedRestOfColumns.map(
        (column) => ({
          ...column,
          value: slice(column.value, start, end + 1),
        })
      );

      const hideSmartRow =
        !aggregationTypes || aggregationTypes.filter(Boolean).length === 0;

      const slicePreviousColumns = [
        ...previousColumns,
        { ...firstColumn, value },
      ];

      return sliceToGroup({
        isExpanded,
        value,
        type: firstColumn.type,
        columns: groupColumns,
        groupId,
        columnIndex,
        hideSmartRow,
        parentHighlight$,
        previousColumns: slicePreviousColumns,
        generateGroups: subGenerateGroups,
        generateSmartRow: subGenerateSmartRow,
        preventExpansion,
        rotate,
        replicaCount: end - start + 1,
      });
    })
  );

  return Promise.all(groups);
};
