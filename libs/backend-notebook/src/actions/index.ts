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
import { appendCodeLine } from './appendCodeLine';
import { updateCodeLine } from './updateCodeLine';
import { appendSliderVariable } from './appendSliderVariable';
import { fillTable } from './fillTable';
import { fillColumn } from './fillColumn';
import { fillRow } from './fillRow';
import { appendPlot } from './appendPlot';
import { setPlotParams } from './setPlotParams';
import { appendChoice } from './appendChoice';

export const actions: Partial<Actions> = {
  createNotebook,
  getElementById,
  removeElement,
  appendElement,
  appendText,
  changeText,
  appendCodeLine,
  updateCodeLine,
  appendEmptyTable,
  appendFilledTable,
  fillTable,
  fillColumn,
  fillRow,
  insertEmptyTableColumn,
  insertFilledTableColumn,
  insertFormulaTableColumn,
  removeTableColumn,
  insertTableRow,
  removeTableRow,
  updateTableCell,
  generateFormula,
  appendDataView,
  appendSliderVariable,
  appendPlot,
  setPlotParams,
  appendChoice,
};
