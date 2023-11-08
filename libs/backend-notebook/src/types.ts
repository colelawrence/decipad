import { SplitCodeResult } from '@decipad/backend-code-assistant';
import type { AnyElement } from '@decipad/editor-types';

interface CreateNotebookResult {
  createdNotebookId: string;
  createdNotebookURL: string;
}
export interface CreateResult {
  createdElementId: string;
  createdElementType: string;
  createdElementName: string;
  createdSubElements?: Array<CreateResult>;
}

export interface PlotParams {
  plotType:
    | 'bar'
    | 'circle'
    | 'square'
    | 'tick'
    | 'line'
    | 'area'
    | 'point'
    | 'arc';
  xColumnName: string;
  yColumnName: string;
  sizeColumnName: string;
  colorColumnName: string;
  thetaColumnName: string;
  y2ColumnName: string;
}

export interface BackendNotebook {
  createNotebook: (params: { title: string }) => CreateNotebookResult;
  getElementById: (params: { elementId: string }) => AnyElement;
  removeElement: (params: { elementId: string }) => void;
  appendElement: (params: { element: AnyElement }) => void; // internal

  // manipulate elements

  // text
  appendText: (params: { markdownText: string }) => CreateResult[];
  changeText: (params: { elementId: string; newText: string }) => void;

  // code lines
  appendCodeLine: (params: {
    variableName: string;
    codeExpression: string;
  }) => CreateResult;
  updateCodeLine: (params: {
    codeLineId: string;
    newVariableName: string;
    newCodeExpression: string;
  }) => void;

  // tables
  appendEmptyTable: (params: {
    tableName: string;
    columnNames: string[];
    rowCount: number;
  }) => CreateResult;
  appendFilledTable: (params: {
    tableName: string;
    columnNames: string[];
    rowsData: string[][];
  }) => CreateResult;
  fillTable: (params: { tableId: string; rowsData: string[][] }) => void;
  fillColumn: (params: {
    tableId: string;
    columnName: string;
    columnData: string[];
  }) => void;
  fillRow: (params: {
    tableId: string;
    rowIndex: number;
    rowData: string[];
  }) => void;
  insertEmptyTableColumn: (params: {
    tableId: string;
    columnName: string;
  }) => CreateResult;
  insertFormulaTableColumn: (params: {
    tableId: string;
    columnName: string;
    formula: string;
  }) => CreateResult;
  insertFilledTableColumn: (params: {
    tableId: string;
    columnName: string;
    cells: string[];
  }) => CreateResult;
  removeTableColumn: (params: { tableId: string; columnName: string }) => void;
  insertTableRow: (params: { tableId: string; row: string[] }) => void;
  removeTableRow: (params: { tableId: string; rowIndex: number }) => void;
  updateTableCell: (params: {
    tableId: string;
    columnName: string;
    rowIndex: number;
    newCellContent: string;
  }) => void;
  setTableColumnFormula: (params: {
    tableId: string;
    columnName: string;
    formula: string;
  }) => void;
  unsetTableColumnFormula: (params: {
    tableId: string;
    columnName: string;
  }) => void;

  // data views
  appendDataView: (params: {
    tableId: string;
    columns: Array<{
      name: string;
      aggregation:
        | 'average'
        | 'max'
        | 'median'
        | 'min'
        | 'span'
        | 'sum'
        | 'stddev';
      round: string;
    }>;
  }) => CreateResult;
  addColumnToDataView: (params: {
    dataviewId: string;
    columnName: string;
  }) => void;
  removeColumnFromDataView: (params: {
    dataviewId: string;
    columnName: string;
  }) => void;
  setDataViewColumns: (params: {
    dataviewId: string;
    columnNames: string[];
  }) => void;

  // plots
  appendPlot: (params: {
    tableId: string;
    plotParams: PlotParams;
  }) => CreateResult;
  setPlotParams: (params: {
    plotId: string;
    newPlotParams: Partial<PlotParams>;
  }) => void;

  // formulas
  generateFormula: (params: { prompt: string }) => SplitCodeResult;

  // sliders
  appendSliderVariable: (params: {
    variableName: string;
    max?: number;
    min?: number;
    step?: number;
    initialValue: number;
  }) => CreateResult;

  // dropdown
  appendChoice: (params: {
    variableName: string;
    options: Array<string>;
    selectedName?: string;
  }) => CreateResult;
}
