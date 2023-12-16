import { getElementById } from './getElementById';
import { removeElement } from './removeElement';
import { appendText } from './appendText';
import { changeText } from './changeText';
import { appendEmptyTable } from './appendEmptyTable';
import { appendFilledTable } from './appendFilledTable';
import { insertFilledTableColumn } from './insertFilledTableColumn';
import { insertFormulaTableColumn } from './insertFormulaTableColumn';
import { removeTableColumn } from './removeTableColumn';
import { insertTableRow } from './insertTableRow';
import { removeTableRow } from './removeTableRow';
import { updateTableCell } from './updateTableCell';
import type { Actions } from './types';
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
import { describeAllNotebookElements } from './describeAllNotebookElements';
import { updateSliderVariable } from './updateSliderVariable';
import { getElementResult } from './getElementResult';
import { changeNotebookTitle } from './changeNotebookTitle';

export const actions: Partial<Actions> = {
  describeAllNotebookElements,
  getElementResult,
  getElementById,
  removeElement,
  appendText,
  changeText,
  changeNotebookTitle,
  appendCodeLine,
  updateCodeLine,
  appendEmptyTable,
  appendFilledTable,
  fillTable,
  fillColumn,
  fillRow,
  insertFilledTableColumn,
  insertFormulaTableColumn,
  removeTableColumn,
  insertTableRow,
  removeTableRow,
  updateTableCell,
  appendDataView,
  appendSliderVariable,
  updateSliderVariable,
  appendPlot,
  setPlotParams,
  appendChoice,
};

export * from './types';
