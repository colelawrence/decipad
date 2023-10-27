import { getElementById } from './getElementById';
import { removeElement } from './removeElement';
import { appendElement } from './appendElement';
import { appendText } from './appendText';
import { changeText } from './changeText';
import { appendEmptyTable } from './appendEmptyTable';
import { appendFilledTable } from './appendFilledTable';
import { insertEmptyTableColumn } from './insertEmptyTableColumn';
import { insertFilledTableColumn } from './insertFilledTableColumn';
import { insertFormulaTableColumn } from './insertFormulaTableColumn';
import { removeTableColumn } from './removeTableColumn';
import { insertTableRow } from './insertTableRow';
import { removeTableRow } from './removeTableRow';
import { updateTableCell } from './updateTableCell';
import { createNotebook } from './createNotebook';
import type { Actions } from './types';
import { generateFormula } from './generateFormula';
import { appendDataView } from './appendDataView';

export const actions: Partial<Actions> = {
  createNotebook,
  getElementById,
  removeElement,
  appendElement,
  appendText,
  changeText,
  appendEmptyTable,
  appendFilledTable,
  insertEmptyTableColumn,
  insertFilledTableColumn,
  insertFormulaTableColumn,
  removeTableColumn,
  insertTableRow,
  removeTableRow,
  updateTableCell,
  generateFormula,
  appendDataView,
};
