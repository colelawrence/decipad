import type { Unit } from '@decipad/computer';
import type {
  TElement,
  TImageElement,
  TMediaEmbedElement,
} from '@udecode/plate';
import {
  DEPRECATED_ELEMENT_CODE_BLOCK,
  DEPRECATED_ELEMENT_TABLE_INPUT,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CALLOUT,
  ELEMENT_CODE_LINE,
  ELEMENT_COLUMNS,
  ELEMENT_FETCH,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_HR,
  ELEMENT_IMAGE,
  ELEMENT_INLINE_NUMBER,
  ELEMENT_INTEGRATION,
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_LINK,
  ELEMENT_MEDIA_EMBED,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_PLOT,
  ELEMENT_TABLE,
  ELEMENT_UL,
  ElementKind,
  IntegrationTypes,
  InteractiveElement,
  MarkKind,
} from '.';
import type {
  DataViewCaptionElement,
  DataViewElement,
  DataViewHeader,
  DataViewHeaderRowElement,
  DataViewNameElement,
} from './data-view';
import type { DrawElement, DrawElementDescendant, DrawElements } from './draw';
import {
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_DATA_VIEW,
  ELEMENT_DISPLAY,
  ELEMENT_DRAW,
  ELEMENT_IMPORT,
  ELEMENT_LIVE_CONNECTION,
  ELEMENT_LIVE_DATASET,
  ELEMENT_LIVE_QUERY,
  ELEMENT_SMART_REF,
  ELEMENT_STRUCTURED_IN,
  ELEMENT_STRUCTURED_IN_CHILD,
  ELEMENT_STRUCTURED_VARNAME,
  ELEMENT_TAB,
  ELEMENT_TITLE,
  ELEMENT_VARIABLE_DEF,
} from './element-kinds';
import type {
  CaptionElement,
  DisplayElement,
  DropdownElement,
  ExpressionElement,
  LiveConnectionVarNameElement,
  LiveDataSetVarNameElement,
  LiveQueryQueryElement,
  LiveQueryVarNameElement,
  SliderElement,
  VariableDefinitionElement,
} from './interactive-elements';
import type {
  DeprecatedTableInputElement,
  TableCaptionElement,
  TableCellElement,
  TableColumnFormulaElement,
  TableElement,
  TableHeaderElement,
  TableHeaderRowElement,
  TableRowElement,
  TableVariableNameElement,
} from './table';

export type { DrawElement, DrawElements, DrawElementDescendant };

// Defining specific elements

export interface BaseElement extends TElement {
  type: ElementKind;
  id: string;
  isHidden?: boolean;
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
export interface ColumnsElement extends BaseElement {
  type: typeof ELEMENT_COLUMNS;
  children: [
    VariableDefinitionElement,
    VariableDefinitionElement,
    ...Array<VariableDefinitionElement>
  ];
}

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
  | ColumnsElement
  // Special elements
  | InteractiveElement
  | LiveConnectionVarNameElement
  | LiveDataSetVarNameElement
  | LiveQueryVarNameElement
  | LiveQueryQueryElement
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
  // Draw Elements
  | DrawElementDescendant;

type InlineElement = LinkElement | InlineNumberElement | SmartRefElement;

// Tabs
export interface TabElement {
  type: typeof ELEMENT_TAB;
  id: string;
  name: string;
  children: MyValue;
}

export interface TitleElement {
  type: typeof ELEMENT_TITLE;
  id: string;
  children: [{ text: string }];
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
  | ColumnsElement
  | InteractiveElement
  | DataViewElement
  | IntegrationTypes.IntegrationBlock;

export type NotebookValue = [TitleElement, ...Array<TabElement>];

export type MyValue = Array<TopLevelValue>;

export type Document = {
  children: MyValue;
};

export type InlineDescendant = InlineElement | RichText;

export type InlineChildren = Array<InlineDescendant>;
export type PlainTextChildren = [PlainText];

export type AnyElement =
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
  ELEMENT_FETCH,
  ELEMENT_PLOT,
  ELEMENT_COLUMNS,
  ELEMENT_VARIABLE_DEF,
  ELEMENT_LIVE_CONNECTION,
  ELEMENT_LIVE_DATASET,
  ELEMENT_IMPORT,
  ELEMENT_DRAW,
  ELEMENT_LIVE_QUERY,
  ELEMENT_INTEGRATION,
  ELEMENT_DISPLAY,
];
