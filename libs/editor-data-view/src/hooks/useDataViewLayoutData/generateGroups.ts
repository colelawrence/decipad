import { BehaviorSubject } from 'rxjs';
import { generateHash } from '@decipad/editor-utils';
import { Result, SerializedType } from '@decipad/computer';
import { AggregationKind, DataGroup } from '../../types';
import { generateSmartRow, GenerateSmartRowProps } from './generateSmartRow';
import { sliceToGroup } from './sliceToGroup';

const { ResultTransforms } = Result;

export interface GenerateGroupsProps {
  columnNames: string[];
  columnData: Result.ColumnLike<Result.Comparable>[];
  columnTypes: SerializedType[];
  columnIndex: number;
  subProperties: {
    type: SerializedType;
    value: Result.Comparable;
    name: string;
  }[];
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
  columnNames,
  columnData,
  columnTypes,
  aggregationTypes,
  collapsedGroups = [],
  columnIndex,
  subProperties,
  parentHighlight$,
  parentGroupId,
}: GenerateGroupsProps & {
  aggregationTypes: (AggregationKind | undefined)[];
  collapsedGroups?: string[];
}): Promise<DataGroup[]> => {
  if (columnData.length !== columnTypes.length) {
    throw new Error(
      `number of columns differs from number of types: ${columnData.length} and ${columnTypes.length}`
    );
  }
  if (columnData.length < 1) {
    return [];
  }
  const [firstColumn, ...restOfColumns] = columnData;
  const [firstType, ...restOfTypes] = columnTypes;

  const sortMap = ResultTransforms.sortMap(firstColumn);
  const sortedFirstColumn = ResultTransforms.applyMap(firstColumn, sortMap);
  const sortedRestOfColumns = restOfColumns.map((column) =>
    ResultTransforms.applyMap(column, sortMap)
  );
  const slices = ResultTransforms.contiguousSlices(sortedFirstColumn);

  const subGenerateGroups: GenerateGroups = (props) =>
    generateGroups({ ...props, aggregationTypes, collapsedGroups });

  const subGenerateSmartRow: GenerateSubSmartRow = (props) =>
    generateSmartRow({ ...props, aggregationTypes });

  const groups = slices.map(async ([start, end]) => {
    const value = sortedFirstColumn.atIndex(start);
    const generatedHash = await generateHash(value);
    const groupId = parentGroupId
      ? `${parentGroupId}/${generatedHash}`
      : generatedHash;

    const isExpanded = !collapsedGroups.includes(groupId);

    const restOfData = sortedRestOfColumns.map((column) =>
      ResultTransforms.slice(column, start, end + 1)
    );

    const hideSmartRow =
      !aggregationTypes || aggregationTypes.filter(Boolean).length === 0;

    const sliceSubProperties = [
      ...subProperties,
      { type: firstType, value, name: columnNames[columnIndex] },
    ];

    return sliceToGroup({
      isExpanded,
      value,
      type: firstType,
      restOfData,
      columnNames,
      restOfTypes,
      groupId,
      columnIndex,
      hideSmartRow,
      parentHighlight$,
      subProperties: sliceSubProperties,
      generateGroups: subGenerateGroups,
      generateSmartRow: subGenerateSmartRow,
    });
  });

  return Promise.all(groups);
};
