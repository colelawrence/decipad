import type {
  Constant,
  SerializedType,
  SerializedTypes,
  Unit,
} from '@decipad/language-interfaces';
import type { TElement } from '@udecode/plate-common';
import type { TExcalidrawProps } from '@udecode/plate-excalidraw';
import {
  ELEMENT_MEDIA_EMBED,
  TImageElement,
  TMediaEmbedElement,
  ELEMENT_IMAGE,
} from '@udecode/plate-media';
import type { Mutable } from 'utility-types';
import type {
  DataViewCaptionElement,
  DataViewElement,
  DataViewHeader,
  DataViewHeaderRowElement,
  DataViewNameElement,
} from './data-view';
import {
  DEPRECATED_ELEMENT_CODE_BLOCK,
  DEPRECATED_ELEMENT_INPUT,
  DEPRECATED_ELEMENT_TABLE_INPUT,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CALLOUT,
  ELEMENT_CAPTION,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_DATA_TAB,
  ELEMENT_DATA_TAB_CHILDREN,
  ELEMENT_DIAMOND,
  ELEMENT_DRAW_IMAGE,
  ELEMENT_DROPDOWN,
  ELEMENT_ELLIPSE,
  ELEMENT_EXPRESSION,
  ELEMENT_FETCH,
  ELEMENT_FREEDRAW,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_HR,
  ELEMENT_INLINE_NUMBER,
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_LINE,
  ELEMENT_LINEAR,
  ELEMENT_LINK,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_PLOT,
  ELEMENT_RECTANGLE,
  ELEMENT_SELECTION,
  ELEMENT_SLIDER,
  ELEMENT_SMART_REF,
  ELEMENT_STRUCTURED_IN_CHILD,
  ELEMENT_STRUCTURED_VARNAME,
  ELEMENT_TAB,
  ELEMENT_TABLE,
  ELEMENT_TABLE_CAPTION,
  ELEMENT_TABLE_COLUMN_FORMULA,
  ELEMENT_TABLE_VARIABLE_NAME,
  ELEMENT_TD,
  ELEMENT_TEXT,
  ELEMENT_TH,
  ELEMENT_TITLE,
  ELEMENT_TR,
  ELEMENT_UL,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_DATA_VIEW,
  ELEMENT_DISPLAY,
  ELEMENT_DRAW,
  ELEMENT_IFRAME,
  ELEMENT_IMPORT,
  ELEMENT_MATH,
  ELEMENT_STRUCTURED_IN,
  ELEMENT_SUBMIT_FORM,
  ELEMENT_VARIABLE_DEF,
  ELEMENT_INTEGRATION,
  ELEMENT_LAYOUT,
  ELEMENT_LIVE_CONNECTION,
} from './element-kinds';
import { UNCOLUMNABLE_KINDS } from './uncolumnable-kinds';
import {
  AcceptableChartShapesForCombo,
  ChartColorSchemeKeys,
  MarkType,
  PlotArcVariant,
  PlotBarVariant,
  PlotLineVariant,
  PlotOrientation,
} from './plot-kinds';
import { UserIconKey } from './icons';
import { IntegrationBlock } from './integrations';
import { ElementKind, markKinds } from '.';

export type SeriesType = 'date' | 'number';

/**
 * Used throughout the table header menu
 * @field value is the name of the dropdown
 */
export type ColumnMenuDropdown = {
  id: string;
  value: string;
  type: 'string' | 'number';
};

/**
 * Dropdown type for table columns.
 * @field id is the reference to the actual dropdown component.
 * @field type is the current type of the dropdown component, stored here so we can
 * use it for changing the icon, instead of asking the computer.
 */
export type TableDropdownType = Readonly<{
  kind: 'dropdown';
  id: string;
  type: 'string' | 'number';
}>;

export type TableCategoryType = Readonly<{
  kind: 'category';
}>;

export type SimpleTableCellType =
  | SerializedTypes.Number
  | SerializedTypes.String
  | SerializedTypes.Boolean
  | SerializedTypes.Date
  | SerializedTypes.Anything;

export type TableCellType =
  | SimpleTableCellType
  | TableDropdownType
  | TableCategoryType
  | Readonly<{ kind: 'table-formula' }>
  | Readonly<{ kind: 'series'; seriesType: SeriesType }>
  | Readonly<{ kind: 'constant'; constant: Constant }>;

export interface TableColumn {
  columnName: string;
  cells: string[];
  cellType: TableCellType;
}

export interface TableData {
  variableName: string;
  columns: TableColumn[];
}

export interface TableColumnFormulaElement extends BaseElement {
  type: typeof ELEMENT_TABLE_COLUMN_FORMULA;
  columnId: string;
  children: (PlainText | SmartRefElement)[];
}

export interface TableVariableNameElement extends BaseElement {
  type: typeof ELEMENT_TABLE_VARIABLE_NAME;
  children: [Text];
}
export interface TableCaptionElement extends BaseElement {
  type: typeof ELEMENT_TABLE_CAPTION;
  children: [TableVariableNameElement, ...TableColumnFormulaElement[]];
}
export interface TableCellElement extends BaseElement {
  type: typeof ELEMENT_TD;
  children: [Text];
}

export interface TableRowElement extends BaseElement {
  type: typeof ELEMENT_TR;
  autoCreated?: boolean;
  children: TableCellElement[];
}

export interface TableHeaderElement extends BaseElement {
  type: typeof ELEMENT_TH;
  cellType: TableCellType;
  autoCreated?: boolean;
  aggregation?: string;
  width?: number;
  children: [Text];
  categoryValues?: Array<{ id: string; value: string }>;
}

export interface TableHeaderRowElement extends BaseElement {
  type: typeof ELEMENT_TR;
  children: TableHeaderElement[];
}

export interface TableElement extends BaseElement {
  type: typeof ELEMENT_TABLE;
  // track the format of the table, IE what does a smartref mean
  version?: number;
  children: [TableCaptionElement, TableHeaderRowElement, ...TableRowElement[]];
  color?: string;
  icon?: string;
  isCollapsed?: boolean;
  hideFormulas?: boolean;
  hideCellFormulas?: boolean;
}

// legacy
export interface DeprecatedTableInputElement extends BaseElement {
  type: typeof DEPRECATED_ELEMENT_TABLE_INPUT;
  tableData: TableData; // legacy table data
  children: [EmptyText];
}

export type ImportElementSource =
  | 'decipad'
  | 'codeconnection'
  | 'gsheets'
  | 'csv'
  | 'json'
  | 'postgresql'
  | 'mysql'
  | 'oracledb'
  | 'cockroachdb'
  | 'redshift'
  | 'mssql'
  | 'mariadb'
  | 'notion'
  | 'bigquery';

export const ImportElementSourcePretty: Record<ImportElementSource, string> = {
  decipad: 'Decipad',
  codeconnection: 'JS',
  gsheets: 'Google Sheets',
  csv: 'CSV',
  json: 'JSON',
  postgresql: 'Postgres',
  mysql: 'MySQL',
  oracledb: 'Oracle',
  cockroachdb: 'CockroachDB',
  redshift: 'RedShift',
  mssql: 'MySQL',
  mariadb: 'MariaDB',
  notion: 'Notion',
  bigquery: 'BigQuery',
};

export interface ImportElement extends BaseElement {
  type: typeof ELEMENT_IMPORT;
  source?: ImportElementSource;
  createdByUserId: string;
  url: string;
  children: [EmptyText];
}

export type ColIndex = number;

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

export interface OldPlotElement extends BaseElement {
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
  xColumnName?: string;
  yColumnName?: string;
  sizeColumnName?: string;
  colorColumnName?: string;
  thetaColumnName?: string;
  children: [EmptyText];
  y2ColumnName?: string;
}

export interface BasePlotProps {
  readonly sourceVarName?: string;
  readonly markType: MarkType;
  readonly xColumnName?: string;
  readonly xAxisLabel?: string;
  readonly yAxisLabel?: string;
  readonly yColumnNames: string[];
  readonly yColumnChartTypes: AcceptableChartShapesForCombo[];
  readonly labelColumnName?: string;
  readonly sizeColumnName?: string;
  readonly orientation: PlotOrientation;
  readonly colorScheme?: ChartColorSchemeKeys;
  readonly grid: boolean;
  readonly startFromZero: boolean;
  readonly mirrorYAxis: boolean;
  readonly flipTable: boolean;
  readonly groupByX: boolean;
  readonly showDataLabel: boolean;
  readonly barVariant: PlotBarVariant;
  readonly lineVariant: PlotLineVariant;
  readonly arcVariant: PlotArcVariant;
  readonly schema: 'jun-2024';
}

export interface PlotElement extends BaseElement, BasePlotProps {
  type: typeof ELEMENT_PLOT;
  title?: string;
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

export interface CaptionElement extends BaseElement {
  type: typeof ELEMENT_CAPTION;
  children: [PlainText];
  icon?: string;
  color?: string;
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
 * Math Element is used for displaying math formulas
 * It's only function is to display the formula
 */
export interface MathElement extends BaseElement {
  type: typeof ELEMENT_MATH;
  /** blockId of the original codeline */
  blockId: string;
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
  variant?: string;
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
  | PlotElement
  | MathElement
  | DisplayElement
  | DeprecatedInputElement
  | ExpressionElement
  | VariableDefinitionElement
  | IntegrationBlock;

export type VariableElement = VariableDefinitionElement | VariableSliderElement;

type DrawElementData = Partial<
  Omit<
    Mutable<Parameters<NonNullable<TExcalidrawProps['onChange']>>['0'][number]>,
    'text' | 'type'
  >
>;

export type DrawElementDescendant = Omit<BaseElement, 'type'> &
  DrawElementData & {
    id: string;
    children: [{ text: '' }];
    isHidden?: boolean;
    __text?: string;
    __dummy?: boolean;
    type:
      | typeof ELEMENT_DRAW
      | typeof ELEMENT_SELECTION
      | typeof ELEMENT_RECTANGLE
      | typeof ELEMENT_DIAMOND
      | typeof ELEMENT_ELLIPSE
      | typeof ELEMENT_TEXT
      | typeof ELEMENT_LINEAR
      | typeof ELEMENT_LINE
      | typeof ELEMENT_FREEDRAW
      | typeof ELEMENT_DRAW_IMAGE;
  };

export type DrawElements = Array<Readonly<DrawElementDescendant>>;
export interface DrawElement extends BaseElement {
  type: typeof ELEMENT_DRAW;
  children: DrawElements;
}

// Defining specific elements

export interface BaseElement extends TElement {
  type: ElementKind;
  id?: string;
  isHidden?: boolean;
  endpointUrlSecretName?: string;
}

// Headings
export interface H1Element extends BaseElement {
  type: typeof ELEMENT_H1;
  children: PlainTextChildren;
}
export interface H2Element extends BaseElement {
  type: typeof ELEMENT_H2;
  children: InlineChildren;
}
export interface H3Element extends BaseElement {
  type: typeof ELEMENT_H3;
  children: InlineChildren;
}

// Text blocks
export interface ParagraphElement extends BaseElement {
  type: typeof ELEMENT_PARAGRAPH;
  children: InlineChildren;
}
export interface BlockquoteElement extends BaseElement {
  type: typeof ELEMENT_BLOCKQUOTE;
  children: InlineChildren;
}
export interface CalloutElement extends BaseElement {
  type: typeof ELEMENT_CALLOUT;
  children: InlineChildren;
  icon?: string;
  color?: string;
}
export interface DividerElement extends BaseElement {
  type: typeof ELEMENT_HR;
  children: [EmptyText];
}

// Media Blocks
export interface ImageElement extends TImageElement, BaseElement {
  type: typeof ELEMENT_IMAGE;
  children: [EmptyText];
}
export interface MediaEmbedElement extends TMediaEmbedElement, BaseElement {
  type: typeof ELEMENT_MEDIA_EMBED;
  children: [EmptyText];
}
export interface IframeEmbedElement extends TImageElement, BaseElement {
  type: typeof ELEMENT_IFRAME;
  url: string;
  children: [EmptyText];
}

// Code
export interface CodeLineElement extends BaseElement {
  type: typeof ELEMENT_CODE_LINE;
  children: Array<PlainText | SmartRefElement>;
}
export interface CodeLineV2Element extends BaseElement {
  type: typeof ELEMENT_CODE_LINE_V2;
  showResult?: boolean;
  children: [StructuredVarnameElement, CodeLineV2ElementCode];
}
export interface StructuredVarnameElement extends BaseElement {
  type: typeof ELEMENT_STRUCTURED_VARNAME;
  children: [PlainText];
}
export interface CodeLineV2ElementCode extends BaseElement {
  type: typeof ELEMENT_CODE_LINE_V2_CODE;
  children: Array<PlainText | SmartRefElement>;
}
export interface DeprecatedCodeBlockElement extends BaseElement {
  type: typeof DEPRECATED_ELEMENT_CODE_BLOCK;
  children: Array<CodeLineElement>;
}

export interface StructuredInputElement extends BaseElement {
  type: typeof ELEMENT_STRUCTURED_IN;
  unit?: string | Unit[];
  children: [StructuredVarnameElement, StructuredInputElementChildren];
}

export interface StructuredInputElementChildren extends BaseElement {
  type: typeof ELEMENT_STRUCTURED_IN_CHILD;
  children: [PlainText];
}

// Lists
export interface UnorderedListElement extends BaseElement {
  type: typeof ELEMENT_UL;
  children: Array<ListItemElement>;
}
export interface OrderedListElement extends BaseElement {
  type: typeof ELEMENT_OL;
  children: Array<ListItemElement>;
}

export type ListElement = UnorderedListElement | OrderedListElement;

export interface ListItemElement extends BaseElement {
  type: typeof ELEMENT_LI;
  children: [ListItemContentElement];
}
export interface ListItemContentElement extends BaseElement {
  type: typeof ELEMENT_LIC;
  children: InlineChildren;
}

// Inline
export interface LinkElement extends BaseElement {
  type: typeof ELEMENT_LINK;
  children: Array<RichText>;
  url: string;
}

export interface InlineNumberElement extends BaseElement {
  type: typeof ELEMENT_INLINE_NUMBER;
  blockId: string;
  children: [EmptyText];
}

export interface SubmitForm extends BaseElement {
  type: typeof ELEMENT_SUBMIT_FORM;
  blockId: string;
  children: [EmptyText];
}

//
// for now just cell, you can add more
// decorations here
//
export type SmartRefDecoration = 'cell';

export interface SmartRefElement extends BaseElement {
  type: typeof ELEMENT_SMART_REF;
  lastSeenVariableName?: string;
  blockId: string;
  /** Identifies the "column" part of the smart ref, if any. */
  columnId: string | null; // dont change, has to do with migration from undefined
  decoration?: SmartRefDecoration;
  children: [PlainText];
}

// Layout
export type ColumnableElement = Exclude<
  TopLevelValue,
  { type: typeof UNCOLUMNABLE_KINDS[number] }
> & {
  columnWidth?: number;
};

export interface LayoutElement extends BaseElement {
  type: typeof ELEMENT_LAYOUT;
  width?: 'full' | 'default';
  children: [ColumnableElement, ...Array<ColumnableElement>];
}

type MarkKind = typeof markKinds[keyof typeof markKinds];

// Overall node types

export type EmptyText = {
  text: '';
};
export type PlainText = EmptyText | { text: string };
export type RichText = PlainText & Partial<Record<MarkKind, true>>;
export type Text = PlainText | RichText;

export type BlockElement =
  // Headings
  | H1Element
  | H2Element
  | H3Element
  // Text blocks
  | ParagraphElement
  | BlockquoteElement
  | CalloutElement
  | DividerElement
  // Media
  | ImageElement
  | MediaEmbedElement
  | DrawElement
  // Code
  | DeprecatedCodeBlockElement
  | CodeLineElement
  | CodeLineV2Element
  // Lists
  | UnorderedListElement
  | OrderedListElement
  | ListItemElement
  | ListItemContentElement
  // Layout
  | LayoutElement
  // Special elements
  | InteractiveElement
  // Table elements
  | DeprecatedTableInputElement
  | TableElement
  | TableCaptionElement
  | TableVariableNameElement
  | TableRowElement
  | TableHeaderRowElement
  | TableHeaderElement
  | TableCellElement
  | ExpressionElement
  | DisplayElement
  | CaptionElement
  | SliderElement
  | DataViewElement
  | DataViewHeaderRowElement
  | DataViewHeader
  | DropdownElement
  | StructuredInputElement
  | StructuredInputElementChildren
  | TableColumnFormulaElement
  | IframeEmbedElement
  // Draw Elements
  | DrawElementDescendant
  // Submit form elements
  | SubmitForm;

type InlineElement = LinkElement | InlineNumberElement | SmartRefElement;

// Tabs
export interface TabElement extends BaseElement {
  type: typeof ELEMENT_TAB;
  id: string;
  name: string;
  icon?: UserIconKey;
  isHidden?: boolean;
  children: MyValue;
}

export interface TitleElement extends BaseElement {
  type: typeof ELEMENT_TITLE;
  id: string;
  children: [{ text: string }];
}

export interface DataTabChildrenElement extends BaseElement {
  type: typeof ELEMENT_DATA_TAB_CHILDREN;
  id: string;
  children: [StructuredVarnameElement, CodeLineV2ElementCode];
}

export interface DataTabElement extends BaseElement {
  type: typeof ELEMENT_DATA_TAB;
  id: string;
  children: Array<DataTabChildrenElement>;
}

export type TopLevelValue =
  | H1Element
  | H2Element
  | H3Element
  | ParagraphElement
  | BlockquoteElement
  | InlineNumberElement
  | SmartRefElement
  | CalloutElement
  | CodeLineElement
  | CodeLineV2Element
  | StructuredInputElement
  | DividerElement
  | ImageElement
  | MediaEmbedElement
  | DrawElement
  | DeprecatedCodeBlockElement
  | UnorderedListElement
  | OrderedListElement
  | LayoutElement
  | InteractiveElement
  | DataViewElement
  | IframeEmbedElement
  | SubmitForm
  | IntegrationBlock;

export type NotebookValue = [
  TitleElement,
  DataTabElement,
  ...Array<TabElement>
];

export type DataTabValue = Array<DataTabChildrenElement>;

export type TitleValue = [TitleElement];

export type RootDocument = {
  children: NotebookValue;
};

export type MyValue = Array<TopLevelValue>;

export type Document = {
  children: MyValue;
};

export type InlineDescendant = InlineElement | RichText;

export type InlineChildren = Array<InlineDescendant>;
export type PlainTextChildren = [PlainText];

export type AnyElement =
  | TitleElement
  | TabElement
  | DataTabElement
  | DataTabChildrenElement
  | BlockElement
  | InlineElement
  | CodeLineV2ElementCode
  | StructuredVarnameElement
  | DataViewCaptionElement
  | DataViewNameElement;

export const topLevelBlockKinds: string[] = [
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_HR,
  ELEMENT_PARAGRAPH,
  ELEMENT_CALLOUT,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_IMAGE,
  DEPRECATED_ELEMENT_CODE_BLOCK, // Legacy
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_STRUCTURED_IN,
  ELEMENT_UL,
  ELEMENT_OL,
  DEPRECATED_ELEMENT_TABLE_INPUT,
  ELEMENT_TABLE,
  ELEMENT_DATA_VIEW,
  ELEMENT_PLOT,
  ELEMENT_LAYOUT,
  ELEMENT_VARIABLE_DEF,
  ELEMENT_DRAW,
  ELEMENT_INTEGRATION,
  ELEMENT_DISPLAY,
  ELEMENT_IFRAME,
  ELEMENT_MEDIA_EMBED,
  ELEMENT_SUBMIT_FORM,
  ELEMENT_MATH,
  ELEMENT_LIVE_CONNECTION,
];
