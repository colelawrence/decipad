import { TElement } from '@udecode/plate';
import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CALLOUT,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_COLUMNS,
  ELEMENT_FETCH,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_HR,
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_LINK,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_PLOT,
  ELEMENT_TABLE,
  ELEMENT_TABLE_INPUT,
  ELEMENT_UL,
  ElementKind,
  InputElement,
  InteractiveElement,
  MarkKind,
} from '.';
import {
  TableCaptionElement,
  TableCellElement,
  TableElement,
  TableHeaderElement,
  TableHeaderRowElement,
  TableInputElement,
  TableRowElement,
  TableColumnFormulaElement,
  TableVariableNameElement,
} from './table';
import { ELEMENT_VARIABLE_DEF } from './element-kinds';
import {
  CaptionElement,
  ExpressionElement,
  SliderElement,
} from './interactive-elements';

// Defining specific elements

export interface BaseElement extends TElement {
  type: ElementKind;
  id: string;
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

// Code
export interface CodeLineElement extends BaseElement {
  type: typeof ELEMENT_CODE_LINE;
  children: PlainTextChildren;
}
export interface CodeBlockElement extends BaseElement {
  type: typeof ELEMENT_CODE_BLOCK;
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

// Layout
export interface ColumnsElement extends BaseElement {
  type: typeof ELEMENT_COLUMNS;
  children: [InputElement, InputElement, ...Array<InputElement>];
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
  // Code
  | CodeBlockElement
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
  | InteractiveElement
  // Table elements
  | TableInputElement
  | TableElement
  | TableCaptionElement
  | TableVariableNameElement
  | TableRowElement
  | TableHeaderRowElement
  | TableHeaderElement
  | TableCellElement
  | ExpressionElement
  | CaptionElement
  | SliderElement
  | TableColumnFormulaElement;
type InlineElement = LinkElement;

export type MyValue = [
  H1Element,
  ...Array<
    | H1Element
    | H2Element
    | H3Element
    | ParagraphElement
    | BlockquoteElement
    | CalloutElement
    | DividerElement
    | CodeBlockElement
    | UnorderedListElement
    | OrderedListElement
    | ColumnsElement
    | InteractiveElement
  >
];

export type Document = {
  children: MyValue;
};

type InlineDescendant = InlineElement | RichText;

type InlineChildren = Array<InlineDescendant>;
type PlainTextChildren = [PlainText];

export const topLevelBlockKinds: string[] = [
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_HR,
  ELEMENT_PARAGRAPH,
  ELEMENT_CALLOUT,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK, // Legacy
  ELEMENT_CODE_LINE,
  ELEMENT_UL,
  ELEMENT_OL,
  ELEMENT_TABLE_INPUT,
  ELEMENT_TABLE,
  ELEMENT_FETCH,
  ELEMENT_PLOT,
  ELEMENT_COLUMNS,
  ELEMENT_VARIABLE_DEF,
];
