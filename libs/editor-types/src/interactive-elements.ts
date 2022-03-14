import {
  ELEMENT_FETCH,
  ELEMENT_INPUT,
  ELEMENT_TABLE_INPUT,
  ELEMENT_PLOT,
  Node,
  BaseElement,
  TableData,
  EmptyText,
} from '.';

export interface TableElement extends BaseElement {
  type: typeof ELEMENT_TABLE_INPUT;
  children: [EmptyText];
  tableData: TableData;
}
export interface FetchElement extends BaseElement {
  type: typeof ELEMENT_FETCH;
  children: [EmptyText];
  'data-auth-url': string;
  'data-contenttype': string;
  'data-error': string;
  'data-external-data-source-id': string;
  'data-external-id': string;
  'data-href': string;
  'data-provider': string;
  'data-varname': string;
}
export interface PlotElement extends BaseElement {
  type: typeof ELEMENT_PLOT;
  sourceVarName: string;
  markType:
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
  children: [EmptyText];
}
export interface InputElement extends BaseElement {
  type: typeof ELEMENT_INPUT;
  children: [EmptyText];
  value: string;
  variableName: string;
}

export type InteractiveElement =
  | TableElement
  | FetchElement
  | PlotElement
  | InputElement;

export const interactiveElements: ReadonlyArray<InteractiveElement['type']> = [
  ELEMENT_FETCH,
  ELEMENT_INPUT,
  ELEMENT_TABLE_INPUT,
  ELEMENT_PLOT,
] as const;

export const isInteractiveElement = (node: Node): node is InteractiveElement =>
  'type' in node && interactiveElements.includes(node.type);
