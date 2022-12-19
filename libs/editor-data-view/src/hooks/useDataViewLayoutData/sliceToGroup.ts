import { Result, SerializedType } from '@decipad/computer';
import { zip } from '@decipad/utils';
import { BehaviorSubject } from 'rxjs';
import { DataGroup } from '../../types';
import { GenerateGroups, GenerateSubSmartRow } from './generateGroups';

interface SliceToGroupProps {
  isExpanded: boolean;
  value: Result.Comparable;
  type: SerializedType;
  hideSmartRow: boolean;
  columnNames: string[];
  restOfData: Result.ColumnLike<Result.Comparable>[];
  restOfTypes: SerializedType[];
  groupId: string;
  columnIndex: number;
  parentHighlight$?: BehaviorSubject<boolean>;
  subProperties: {
    type: SerializedType;
    value: Result.Comparable;
    name: string;
  }[];
  generateGroups: GenerateGroups;
  generateSmartRow: GenerateSubSmartRow;
}

export const sliceToGroup = async ({
  isExpanded,
  restOfData,
  value,
  type,
  columnNames,
  restOfTypes,
  hideSmartRow,
  groupId,
  columnIndex,
  parentHighlight$,
  subProperties,
  generateGroups,
  generateSmartRow,
}: SliceToGroupProps): Promise<DataGroup> => {
  const selfHighlight$ = new BehaviorSubject<boolean>(false);

  const newGroups = await generateGroups({
    columnNames,
    columnData: restOfData,
    columnTypes: restOfTypes,
    columnIndex: columnIndex + 1,
    subProperties,
    parentHighlight$: selfHighlight$,
    parentGroupId: groupId,
  });

  const expandable = newGroups.length > 1;

  const smartRow =
    (!hideSmartRow &&
      expandable &&
      columnIndex + 1 < columnNames.length &&
      generateSmartRow({
        columns: zip(restOfTypes, restOfData),
        columnNames,
        columnIndex: columnIndex + 1,
        subProperties,
        parentHighlight$,
      })) ||
    null;

  const children = [
    smartRow,
    ...(isExpanded || !expandable ? newGroups : []),
  ].filter(Boolean) as DataGroup[];

  return {
    elementType: 'group',
    id: groupId,
    value,
    type,
    children,
    collapsible: expandable,
    selfHighlight$,
    parentHighlight$,
    columnIndex,
  };
};
