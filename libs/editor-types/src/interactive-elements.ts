import {
  ELEMENT_FETCH,
  ELEMENT_INPUT,
  ELEMENT_TABLE_INPUT,
  ELEMENT_PLOT,
  Node,
  BaseElement,
  EmptyText,
  PlainText,
} from '.';
import type { TableElement, TableInputElement } from './table';
import {
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
  ELEMENT_VARIABLE_DEF,
} from './element-kinds';

export type { TableElement };
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
  title?: string;
  colorScheme?: string;
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

export interface CaptionElement extends BaseElement {
  type: typeof ELEMENT_CAPTION;
  children: [PlainText];
}

export interface ExpressionElement extends BaseElement {
  type: typeof ELEMENT_EXPRESSION;
  children: [PlainText];
}
export interface VariableDefinitionElement extends BaseElement {
  type: typeof ELEMENT_VARIABLE_DEF;
  children: [CaptionElement, ExpressionElement];
}

export type InteractiveElement =
  | TableInputElement
  | TableElement
  | FetchElement
  | PlotElement
  | InputElement
  | VariableDefinitionElement;

export const interactiveElementKinds: ReadonlyArray<
  InteractiveElement['type']
> = [
  ELEMENT_FETCH,
  ELEMENT_INPUT,
  ELEMENT_TABLE_INPUT,
  ELEMENT_PLOT,
  ELEMENT_VARIABLE_DEF,
] as const;

export const isInteractiveElement = (node: Node): node is InteractiveElement =>
  'type' in node && interactiveElementKinds.includes(node.type);
