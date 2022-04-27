import { Editor, Path } from 'slate';
import { getColumnNames } from './getColumnNames';

export const getColumnName = (
  editor: Editor,
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
