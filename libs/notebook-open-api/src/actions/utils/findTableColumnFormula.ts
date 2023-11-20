import {
  ELEMENT_TABLE_COLUMN_FORMULA,
  MyEditor,
  TableColumnFormulaElement,
  TableHeaderElement,
} from '@decipad/editor-types';
import { isElementOfType } from '@decipad/editor-utils';
import { TNodeEntry, findNode } from '@udecode/plate';

export const findTableColumnFormula = (
  editor: MyEditor,
  columnEntry: TNodeEntry<TableHeaderElement>
): TNodeEntry<TableColumnFormulaElement> | undefined => {
  const tableCaptionPath = [...columnEntry[1].slice(-2), 0];
  return findNode(editor, {
    at: tableCaptionPath,
    match: (node) => isElementOfType(node, ELEMENT_TABLE_COLUMN_FORMULA),
  });
};
