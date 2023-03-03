import type { SerializedType } from '@decipad/computer';
import {
  BaseElement,
  BlockElement,
  ELEMENT_EVAL,
  ELEMENT_FETCH,
  DEPRECATED_ELEMENT_INPUT,
  ELEMENT_PLOT,
  EmptyText,
  PlainText,
} from '.';
import {
  ELEMENT_CAPTION,
  ELEMENT_DISPLAY,
  ELEMENT_DROPDOWN,
  ELEMENT_EXPRESSION,
  ELEMENT_IMPORT,
  ELEMENT_LIVE_CONNECTION,
  ELEMENT_LIVE_CONNECTION_VARIABLE_NAME,
  ELEMENT_SLIDER,
  ELEMENT_VARIABLE_DEF,
} from './element-kinds';
import type {
  TableCellType,
  TableElement,
  DeprecatedTableInputElement,
} from './table';

export type { TableElement };

export type ImportElementSource =
  | 'decipad'
  | 'gsheets'
  | 'csv'
  | 'json'
  | 'arrow';
export interface ImportElement extends BaseElement {
  type: typeof ELEMENT_IMPORT;
  source?: ImportElementSource;
  createdByUserId: string;
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
export interface DeprecatedInputElement extends BaseElement {
  type: typeof DEPRECATED_ELEMENT_INPUT;
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

/**
 * Display Element is what we call the Result widget.
 * It can display variables and calculations defined in the document
 */
export interface DisplayElement extends BaseElement {
  type: typeof ELEMENT_DISPLAY;
  /** blockId of the calculation/widget it is displaying */
  blockId: string;
  /**
    varName the last known variable name of the result, this is here
    because calculating it is expensive, so we need to cache it.
  */
  varName?: string;
  children: [EmptyText];
}

/**
 * Dropdown element defines the element that lives in a VariableDef
 * to enable dropdown behavior.
 */
export interface DropdownElement extends BaseElement {
  type: typeof ELEMENT_DROPDOWN;
  options: Array<{ id: string; value: string }>;
  smartSelection?: boolean;
  /** Used when it's a smart selection, to remember the column that is selected */
  selectedColumn?: string;
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

export type ElementVariants =
  | 'expression'
  | 'toggle'
  | 'date'
  | 'slider'
  | 'dropdown'
  | 'display';
export interface VariableBaseElement<
  V extends ElementVariants,
  T extends BlockElement[]
> extends BaseElement {
  type: typeof ELEMENT_VARIABLE_DEF;
  variant: V;
  children: [CaptionElement, ...T];
  coerceToType?: SerializedType;
}

export type VariableExpressionElement = VariableBaseElement<
  'expression',
  [ExpressionElement]
>;

export type VariableToggleElement = VariableBaseElement<
  'toggle',
  [ExpressionElement]
>;

export type VariableDateElement = VariableBaseElement<
  'date',
  [ExpressionElement]
>;

export type VariableDropdownElement = VariableBaseElement<
  'dropdown',
  [DropdownElement]
>;

export type VariableSliderElement = VariableBaseElement<
  'slider',
  [ExpressionElement, SliderElement]
>;

export type VariableDefinitionElement =
  | VariableToggleElement
  | VariableDateElement
  | VariableExpressionElement
  | VariableDropdownElement
  | VariableSliderElement;

export type InteractiveElement =
  | DeprecatedTableInputElement
  | TableElement
  | FetchElement
  | ImportElement
  | LiveConnectionElement
  | PlotElement
  | EvalElement
  | DisplayElement
  | DeprecatedInputElement
  | VariableDefinitionElement;

export type VariableElement = VariableDefinitionElement | VariableSliderElement;
