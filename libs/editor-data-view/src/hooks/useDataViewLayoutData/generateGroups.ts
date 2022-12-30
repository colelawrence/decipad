import { BehaviorSubject } from 'rxjs';
import { generateHash } from '@decipad/editor-utils';
import { Result } from '@decipad/computer';
import {
  AggregationKind,
  DataGroup,
  PreviousColumns,
  VirtualColumn,
} from '../../types';
import { generateSmartRow, GenerateSmartRowProps } from './generateSmartRow';
import { sliceToGroup } from './sliceToGroup';

const { ResultTransforms } = Result;

export interface GenerateGroupsProps {
  columns: VirtualColumn[];
  columnIndex: number;
  previousColumns: PreviousColumns;
  parentGroupId?: string;
  parentHighlight$?: BehaviorSubject<boolean>;
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
}: GenerateGroupsProps & {
  aggregationTypes: (AggregationKind | undefined)[];
  expandedGroups?: string[];
}): Promise<DataGroup[]> => {
  if (columns.length < 1) {
    return [];
  }
  const [firstColumn, ...restOfColumns] = columns;

  const sortMap = ResultTransforms.sortMap(firstColumn.value);
  const sortedFirstColumn = ResultTransforms.applyMap(
    firstColumn.value,
    sortMap
  );
  const sortedRestOfColumns: VirtualColumn[] = restOfColumns.map((column) => ({
    ...column,
    value: ResultTransforms.applyMap(column.value, sortMap),
  }));
  const slices = ResultTransforms.contiguousSlices(sortedFirstColumn);

  const subGenerateGroups: GenerateGroups = (props) =>
    generateGroups({ ...props, aggregationTypes, expandedGroups });

  const subGenerateSmartRow: GenerateSubSmartRow = (props) =>
    generateSmartRow({ ...props, aggregationTypes });

  const groups = slices.map(async ([start, end]) => {
    const value = sortedFirstColumn.atIndex(start);
    const generatedHash = await generateHash(value);
    const groupId = parentGroupId
      ? `${parentGroupId}/${generatedHash}`
      : generatedHash;

    const isExpanded = expandedGroups.includes(groupId);

    const groupColumns: VirtualColumn[] = sortedRestOfColumns.map((column) => ({
      ...column,
      value: ResultTransforms.slice(column.value, start, end + 1),
    }));

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
    });
  });

  return Promise.all(groups);
};
