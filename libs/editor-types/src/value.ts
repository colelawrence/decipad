import { TElement, TImageElement, TMediaEmbedElement } from '@udecode/plate';
import {
  DEPRECATED_ELEMENT_CODE_BLOCK,
  DEPRECATED_ELEMENT_TABLE_INPUT,
  ElementKind,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CALLOUT,
  ELEMENT_CODE_LINE,
  ELEMENT_COLUMNS,
  ELEMENT_EVAL,
  ELEMENT_FETCH,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_HR,
  ELEMENT_IMAGE,
  ELEMENT_INLINE_NUMBER,
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_LINK,
  ELEMENT_MEDIA_EMBED,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_PLOT,
  ELEMENT_TABLE,
  ELEMENT_UL,
  EvalElement,
  InteractiveElement,
  MarkKind,
} from '.';
import {
  DataViewElement,
  DataViewHeader,
  DataViewHeaderRowElement,
} from './data-view';
import {
  ELEMENT_DATA_VIEW,
  ELEMENT_DRAW,
  ELEMENT_IMPORT,
  ELEMENT_LIVE_CONNECTION,
  ELEMENT_SMART_REF,
  ELEMENT_VARIABLE_DEF,
} from './element-kinds';
import {
  CaptionElement,
  DisplayElement,
  DropdownElement,
  ExpressionElement,
  LiveConnectionVarNameElement,
  SliderElement,
  VariableDefinitionElement,
} from './interactive-elements';
import {
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
import { DrawElement, DrawElements, DrawElementDescendant } from './draw';

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
  children: PlainTextChildren;
}
export interface H3Element extends BaseElement {
  type: typeof ELEMENT_H3;
  children: PlainTextChildren;
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
  isUnpinned?: boolean;
}
export interface DeprecatedCodeBlockElement extends BaseElement {
  type: typeof DEPRECATED_ELEMENT_CODE_BLOCK;
  children: Array<CodeLineElement>;
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

export interface SmartRefElement extends BaseElement {
  type: typeof ELEMENT_SMART_REF;
  blockId: string;
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
  | TableColumnFormulaElement
  // Draw Elements
  | DrawElementDescendant;

type InlineElement = LinkElement | InlineNumberElement | SmartRefElement;

export type MyValue = [
  H1Element,
  ...Array<
    | H1Element
    | H2Element
    | H3Element
    | ParagraphElement
    | BlockquoteElement
    | InlineNumberElement
    | SmartRefElement
    | CalloutElement
    | CodeLineElement
    | DividerElement
    | EvalElement
    | ImageElement
    | MediaEmbedElement
    | DrawElement
    | CodeLineElement
    | DeprecatedCodeBlockElement
    | UnorderedListElement
    | OrderedListElement
    | ColumnsElement
    | InteractiveElement
    | DataViewElement
  >
];

export type Document = {
  children: MyValue;
};

type InlineDescendant = InlineElement | RichText;

type InlineChildren = Array<InlineDescendant>;
type PlainTextChildren = [PlainText];

export type AnyElement = BlockElement | InlineElement;

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
  ELEMENT_UL,
  ELEMENT_OL,
  DEPRECATED_ELEMENT_TABLE_INPUT,
  ELEMENT_TABLE,
  ELEMENT_DATA_VIEW,
  ELEMENT_FETCH,
  ELEMENT_PLOT,
  ELEMENT_COLUMNS,
  ELEMENT_EVAL,
  ELEMENT_VARIABLE_DEF,
  ELEMENT_LIVE_CONNECTION,
  ELEMENT_IMPORT,
  ELEMENT_DRAW,
];
