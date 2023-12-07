import type { AnyElement } from '@decipad/editor-types';

export interface NotebookError {
  elementId: string;
  error: string;
}

export interface ActionResultWithNotebookError<T> {
  result: T;
  notebookErrors: Array<NotebookError>;
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

export type AllNotebookElementsDescriptionResult = Array<{
  elementId: string;
  type: string;
  description: string;
}>;

export type GenericSummaryResult<T = object> = T & {
  summary?: string;
};

export interface NotebookOpenApi {
  // get notebook elements
  describeAllNotebookElements: (
    params: Record<string, undefined>
  ) => GenericSummaryResult<AllNotebookElementsDescriptionResult>;
  getElementResult: (
    params:
      | { varName: string; elementId?: undefined }
      | { elementId: string; varName?: undefined }
  ) => string;

  // basic element manipulation
  getElementById: (params: {
    elementId: string;
  }) => GenericSummaryResult<AnyElement>;
  removeElement: (params: { elementId: string }) => GenericSummaryResult;
  appendElement: (params: { element: AnyElement }) => GenericSummaryResult; // internal

  // manipulate elements

  // text
  appendText: (params: {
    markdownText: string;
  }) => GenericSummaryResult<{ createdElements: CreateResult[] }>;
  changeText: (params: {
    elementId: string;
    newText: string;
  }) => GenericSummaryResult;

  // code lines
  appendCodeLine: (params: {
    variableName: string;
    codeExpression: string;
  }) => GenericSummaryResult<CreateResult>;
  updateCodeLine: (params: {
    codeLineId: string;
    newVariableName: string;
    newCodeExpression: string;
  }) => GenericSummaryResult;

  // tables
  appendEmptyTable: (params: {
    tableName: string;
    columnNames: string[];
    rowCount: number;
  }) => GenericSummaryResult<CreateResult>;
  appendFilledTable: (params: {
    tableName: string;
    columnNames: string[];
    rowsData: string[][];
  }) => GenericSummaryResult<CreateResult>;
  fillTable: (params: {
    tableId: string;
    rowsData: string[][];
  }) => GenericSummaryResult;
  fillColumn: (params: {
    tableId: string;
    columnName: string;
    columnData: string[];
  }) => GenericSummaryResult;
  fillRow: (params: {
    tableId: string;
    rowIndex: number;
    rowData: string[];
  }) => GenericSummaryResult;
  insertEmptyTableColumn: (params: {
    tableId: string;
    columnName: string;
  }) => GenericSummaryResult<CreateResult>;
  insertFormulaTableColumn: (params: {
    tableId: string;
    columnName: string;
    formula: string;
  }) => GenericSummaryResult<CreateResult>;
  insertFilledTableColumn: (params: {
    tableId: string;
    columnName: string;
    cells: string[];
  }) => GenericSummaryResult<CreateResult>;
  removeTableColumn: (params: {
    tableId: string;
    columnName: string;
  }) => GenericSummaryResult;
  insertTableRow: (params: {
    tableId: string;
    row: string[];
  }) => GenericSummaryResult;
  removeTableRow: (params: {
    tableId: string;
    rowIndex: number;
  }) => GenericSummaryResult;
  updateTableCell: (params: {
    tableId: string;
    columnName: string;
    rowIndex: number;
    newCellContent: string;
  }) => GenericSummaryResult;
  setTableColumnFormula: (params: {
    tableId: string;
    columnName: string;
    formula: string;
  }) => GenericSummaryResult;
  unsetTableColumnFormula: (params: {
    tableId: string;
    columnName: string;
  }) => GenericSummaryResult;

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
  }) => GenericSummaryResult<CreateResult>;
  addColumnToDataView: (params: {
    dataviewId: string;
    columnName: string;
  }) => GenericSummaryResult;
  removeColumnFromDataView: (params: {
    dataviewId: string;
    columnName: string;
  }) => GenericSummaryResult;
  setDataViewColumns: (params: {
    dataviewId: string;
    columnNames: string[];
  }) => GenericSummaryResult;

  // plots
  appendPlot: (params: {
    tableId: string;
    plotParams: PlotParams;
  }) => GenericSummaryResult<CreateResult>;
  setPlotParams: (params: {
    plotId: string;
    newPlotParams: Partial<PlotParams>;
  }) => GenericSummaryResult;

  // sliders
  appendSliderVariable: (params: {
    variableName: string;
    max?: number;
    min?: number;
    step?: number;
    initialValue: number;
    unit?: string;
  }) => GenericSummaryResult<CreateResult>;

  updateSliderVariable: (params: {
    elementId: string;
    variableName?: string;
    max?: number;
    min?: number;
    step?: number;
    value?: number;
    unit?: string;
  }) => GenericSummaryResult;

  // dropdown
  appendChoice: (params: {
    variableName: string;
    options: Array<string>;
    selectedName?: string;
  }) => GenericSummaryResult<CreateResult>;
}
