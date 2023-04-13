import { SerializedType } from '@decipad/computer';
import { BehaviorSubject } from 'rxjs';
import { Comparable } from '@decipad/universal-compare';
import { DataGroup, PreviousColumns, VirtualColumn } from '../../types';
import type { GenerateGroups, GenerateSubSmartRow } from './generateGroups';

interface SliceToGroupProps {
  isExpanded: boolean;
  value: Comparable | undefined;
  type: SerializedType;
  hideSmartRow: boolean;
  columns: VirtualColumn[];
  groupId: string;
  columnIndex: number;
  parentHighlight$?: BehaviorSubject<boolean>;
  previousColumns: PreviousColumns;
  generateGroups: GenerateGroups;
  generateSmartRow: GenerateSubSmartRow;
  preventExpansion: boolean;
  rotate: boolean;
}

export const sliceToGroup = async ({
  isExpanded,
  value,
  type,
  columns,
  hideSmartRow,
  groupId,
  columnIndex,
  parentHighlight$,
  previousColumns,
  generateGroups,
  generateSmartRow,
  preventExpansion,
  rotate,
}: SliceToGroupProps): Promise<DataGroup> => {
  const selfHighlight$ = new BehaviorSubject<boolean>(false);

  const newGroups = await generateGroups({
    columns,
    columnIndex: columnIndex + 1,
    previousColumns,
    parentHighlight$: selfHighlight$,
    parentGroupId: groupId,
    preventExpansion,
    rotate,
  });

  const expandable = newGroups.length > 1;

  const smartRow =
    (!hideSmartRow &&
      expandable &&
      generateSmartRow({
        columns,
        columnIndex: columnIndex + 1,
        previousColumns,
        parentHighlight$,
        rotate,
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
