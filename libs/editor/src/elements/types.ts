import { SPEditor } from '@udecode/plate';
import { ReactEditor } from 'slate-react';
import {
  ElementKind,
  ELEMENT_TABLE_INPUT,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_H1,
  ELEMENT_LINK,
} from './kinds';
import { TableData } from '../types';
import * as marks from '../marks';

// Defining specific elements

interface BaseElement {
  type: ElementKind;
  children: Array<Descendant>;
  id?: string;
}

export interface H1Element extends BaseElement {
  type: typeof ELEMENT_H1;
  children: [PlainText];
}

export interface LinkElement extends BaseElement {
  type: typeof ELEMENT_LINK;
  url: string;
}

export interface TableElement extends BaseElement {
  type: typeof ELEMENT_TABLE_INPUT;
  tableData: TableData;
}

export interface CodeLineElement extends BaseElement {
  type: typeof ELEMENT_CODE_LINE;
  children: [PlainText];
}
export interface CodeBlockElement {
  type: typeof ELEMENT_CODE_BLOCK;
  children: Array<CodeLineElement>;
  id?: string;
}

// TODO type our remaining elements
export interface OtherElement extends BaseElement {
  type: Exclude<
    ElementKind,
    | typeof ELEMENT_LINK
    | typeof ELEMENT_TABLE_INPUT
    | typeof ELEMENT_CODE_BLOCK
    | typeof ELEMENT_H1
  >;
}

// Overall node types

export type Element =
  | H1Element
  | LinkElement
  | TableElement
  | CodeBlockElement
  | OtherElement;

export type PlainText = {
  text: string;
};
export type RichText = PlainText & Partial<Record<keyof typeof marks, true>>;

export type Editor = SPEditor &
  ReactEditor & {
    children: Element[];
  };

type Descendant = Element | RichText;
