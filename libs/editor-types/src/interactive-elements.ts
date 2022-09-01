import type { SerializedType } from '@decipad/computer';
import { isElement } from '@udecode/plate';
import {
  BaseElement,
  BlockElement,
  ELEMENT_EVAL,
  ELEMENT_FETCH,
  ELEMENT_INPUT,
  ELEMENT_PLOT,
  ELEMENT_TABLE_INPUT,
  EmptyText,
  MyNode,
  PlainText,
} from '.';
import {
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
  ELEMENT_IMPORT,
  ELEMENT_LIVE_CONNECTION,
  ELEMENT_LIVE_CONNECTION_VARIABLE_NAME,
  ELEMENT_SLIDER,
  ELEMENT_VARIABLE_DEF,
} from './element-kinds';
import type { TableCellType, TableElement, TableInputElement } from './table';

export type { TableElement };

export type ImportElementSource = 'gsheets' | 'csv' | 'json' | 'arrow';
export interface ImportElement extends BaseElement {
  type: typeof ELEMENT_IMPORT;
  source?: ImportElementSource;
  url: string;
  children: [EmptyText];
}

export interface LiveConnectionVarNameElement extends BaseElement {
  type: typeof ELEMENT_LIVE_CONNECTION_VARIABLE_NAME;
  children: [PlainText];
}

// live connection

export type ColIndex = number;
export interface LiveConnectionElement extends BaseElement {
  type: typeof ELEMENT_LIVE_CONNECTION;
  url: string;
  source?: ImportElementSource;
  isFirstRowHeaderRow: boolean;
  columnTypeCoercions: Record<ColIndex, TableCellType>;
  children: [LiveConnectionVarNameElement];
}

// legacy FetchElement
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
  icon: string;
  color: string;
}

export interface EvalElement extends BaseElement {
  type: typeof ELEMENT_EVAL;
  result: string;
  children: [PlainText];
}

export interface CaptionElement extends BaseElement {
  type: typeof ELEMENT_CAPTION;
  children: [PlainText];
  icon: string;
  color: string;
}

export interface ExpressionElement extends BaseElement {
  type: typeof ELEMENT_EXPRESSION;
  children: [PlainText];
}

export interface SliderElement extends BaseElement {
  type: typeof ELEMENT_SLIDER;
  max: string;
  min: string;
  step: string;
  value: string;
  children: [EmptyText];
}

export interface VariableBaseElement<V extends string, T extends BlockElement[]>
  extends BaseElement {
  type: typeof ELEMENT_VARIABLE_DEF;
  variant: V;
  coerceToType?: SerializedType;
  children: [CaptionElement, ...T];
}

export type VariableExpressionElement = VariableBaseElement<
  'expression',
  [ExpressionElement]
>;

export type VariableSliderElement = VariableBaseElement<
  'slider',
  [ExpressionElement, SliderElement]
>;

export type VariableDefinitionElement =
  | VariableExpressionElement
  | VariableSliderElement;

export type InteractiveElement =
  | TableInputElement
  | TableElement
  | FetchElement
  | ImportElement
  | LiveConnectionElement
  | PlotElement
  | EvalElement
  | InputElement
  | VariableDefinitionElement;

export type VariableElement = VariableDefinitionElement | VariableSliderElement;

export const interactiveElementKinds: ReadonlyArray<
  InteractiveElement['type']
> = [
  ELEMENT_FETCH,
  ELEMENT_IMPORT,
  ELEMENT_INPUT,
  ELEMENT_TABLE_INPUT,
  ELEMENT_PLOT,
  ELEMENT_EVAL,
  ELEMENT_VARIABLE_DEF,
] as const;

export const isInteractiveElement = (
  node: MyNode
): node is InteractiveElement =>
  isElement(node) &&
  interactiveElementKinds.includes(node.type as InteractiveElement['type']);
