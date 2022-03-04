import { SPEditor } from '@udecode/plate';
import { ReactEditor } from 'slate-react';
import {
  ElementKind,
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_UL,
  ELEMENT_OL,
  ELEMENT_TABLE_INPUT,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_LINK,
  ELEMENT_FETCH,
  ELEMENT_PARAGRAPH,
  ELEMENT_BLOCKQUOTE,
} from './kinds';
import { TableData } from '../types';
import { MarkKind } from '../marks';

// Defining specific elements

interface BaseElement {
  type: ElementKind;
  children: Array<Descendant>;
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

// Special elements
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

// Overall node types

type EmptyText = {
  text: '';
};
type PlainText = EmptyText | { text: string };
export type RichText = PlainText & Partial<Record<MarkKind, true>>;

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
  // Special elements
  | FetchElement
  | TableElement;
type InlineElement = LinkElement;
export type Element = BlockElement | InlineElement;

export type Editor = Omit<SPEditor & ReactEditor, 'children'> & {
  children: [
    H1Element,
    ...Array<
      | H1Element
      | H2Element
      | H3Element
      | TableElement
      | ParagraphElement
      | BlockquoteElement
      | CodeBlockElement
      | UnorderedListElement
      | OrderedListElement
      | FetchElement
    >
  ];
};

type InlineDescendant = InlineElement | RichText;
type Descendant = Element | RichText;

type InlineChildren = Array<InlineDescendant>;
type PlainTextChildren = [PlainText];

export type Node = Editor | Element;
