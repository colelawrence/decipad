import { Path } from 'slate';
import {
  ELEMENT_TABLE_COLUMN_FORMULA,
  TableElement,
} from '@decipad/editor-types';

export const findTableFormulaPath = (
  table: TableElement,
  tablePath: Path,
  columnIndex: number
): Path | null => {
  const columnColumnElement = table.children[1].children[columnIndex];
  const formulaElement = table.children[0].children.findIndex(
    (el) =>
      el.type === ELEMENT_TABLE_COLUMN_FORMULA &&
      el.columnId === columnColumnElement.id
  );

  if (formulaElement < 0) {
    return null;
  }

  return [...tablePath, 0, formulaElement];
};
