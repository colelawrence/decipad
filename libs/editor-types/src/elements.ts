import { PlateEditor } from '@udecode/plate';
import {
  Editor as SlateEditor,
  Element as SlateElement,
  Text as SlateText,
} from 'slate';
import { ReactEditor } from 'slate-react';
import {
  ElementKind,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_COLUMNS,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_LINK,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_UL,
  InputElement,
  InteractiveElement,
  ELEMENT_TABLE_INPUT,
  ELEMENT_FETCH,
  ELEMENT_PLOT,
  MarkKind,
} from '.';

// Defining specific elements

export interface BaseElement {
  type: ElementKind;
  children: Array<Descendant | PlainText | RichText>;
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
export interface ListItemElement extends BaseElement {
  type: typeof ELEMENT_LI;
  children:
    | [ListItemContentElement]
    | [ListItemContentElement, UnorderedListElement | OrderedListElement];
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
  | InteractiveElement;
type InlineElement = LinkElement;
export type Element = BlockElement | InlineElement;

export type Editor = Omit<
  SlateEditor & PlateEditor & ReactEditor,
  'children'
> & {
  children: [
    H1Element,
    ...Array<
      | H1Element
      | H2Element
      | H3Element
      | ParagraphElement
      | BlockquoteElement
      | CodeBlockElement
      | UnorderedListElement
      | OrderedListElement
      | ColumnsElement
      | InteractiveElement
    >
  ];
};

type InlineDescendant = InlineElement | RichText;
export type Descendant = Element | Text;

type InlineChildren = Array<InlineDescendant>;
type PlainTextChildren = [PlainText];

export type Node = Editor | Descendant;

export function isElement(node: unknown): node is Element {
  return SlateElement.isElement(node);
}

export function isText(node: Node): node is Text {
  return SlateText.isText(node);
}

export const topLevelBlockKinds: string[] = [
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_PARAGRAPH,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_UL,
  ELEMENT_OL,
  ELEMENT_TABLE_INPUT,
  ELEMENT_FETCH,
  ELEMENT_PLOT,
  ELEMENT_COLUMNS,
];
