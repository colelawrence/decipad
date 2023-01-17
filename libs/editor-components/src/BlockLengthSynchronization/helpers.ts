import { ELEMENT_CODE_LINE_V2 } from '@decipad/editor-types';
import {
  ColumnGroupName,
  ColumnWidths,
  initialGroups,
} from './BlockLengthSynchronizationProvider';

const blockTypes = new Set([ELEMENT_CODE_LINE_V2]);

export type MeasuredLengths = Map<string, Partial<ColumnWidths>>;

export function setIn(
  measuredLengths: MeasuredLengths,
  blockId: string,
  group: ColumnGroupName,
  length: number | undefined
) {
  if (length != null) {
    const current = measuredLengths.get(blockId) ?? {};
    current[group] = length;
    measuredLengths.set(blockId, current);
  } else {
    const current = measuredLengths.get(blockId) ?? {};
    delete current[group];
    if (Object.keys(current).length === 0) {
      measuredLengths.delete(blockId);
    }
  }
}

export function getNewGroupsTargetLengths(
  groups: { memberIds: string[] }[],
  measuredLengths: Map<string, Partial<ColumnWidths>>
) {
  const ret = new Map<string, ColumnWidths>();

  for (const { memberIds } of groups) {
    const lengthsPerGroup: ColumnWidths = { ...initialGroups };

    for (const groupName of Object.keys(lengthsPerGroup) as ColumnGroupName[]) {
      const lengths = memberIds.flatMap(
        (id) => measuredLengths.get(id)?.[groupName] ?? []
      );
      lengthsPerGroup[groupName] = Math.max(...lengths);
    }

    for (const id of memberIds) {
      ret.set(id, lengthsPerGroup);
    }
  }

  return ret;
}

type MockableEditorChildren = { id: string; type: string }[];
/** Groups children into contiguous groups of {blockTypes}-type blocks.
 *
 * - code line "TaxRate"
 * - structured inp "MyTax"
 * - code line "TaxAmount"
 * - paragraph
 * - code line "Total"
 * - code line "GrandTotal"
 *
 * Would create 2 groups.
 */
export function getContiguousGroups(editorChildren: MockableEditorChildren) {
  const groups: { memberIds: string[] }[] = [];
  let inGroup = false;

  for (const block of editorChildren) {
    if (!blockTypes.has(block.type)) {
      inGroup = false;
      continue;
    }

    if (!inGroup) {
      inGroup = true;
      groups.push({ memberIds: [block.id] });
    } else {
      groups[groups.length - 1].memberIds.push(block.id);
    }
  }

  return groups;
}
