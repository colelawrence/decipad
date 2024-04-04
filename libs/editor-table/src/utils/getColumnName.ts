import type { Path } from 'slate';
import { getColumnNames } from './getColumnNames';
import type { TEditor, Value } from '@udecode/plate-common';

export const getColumnName = <
  TV extends Value,
  TE extends TEditor<TV> = TEditor<TV>
>(
  editor: TE,
  tablePath: Path,
  start: number
): string => {
  const columnNames = getColumnNames(editor, tablePath);
  let num = start;
  const createProposal = () => `Column${num}`;
  let proposal = createProposal();
  while (columnNames.has(proposal)) {
    num += 1;
    proposal = createProposal();
  }
  return proposal;
};
