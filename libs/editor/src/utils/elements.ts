import { ELEMENT_LINK } from '@udecode/plate';
import {
  ElementType,
  ELEMENT_TABLE_INPUT,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
} from './elementTypes';
import { TableData } from './tableTypes';

export interface BaseElement {
  type: ElementType;
  children: Array<Node>;
  id?: string;
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
  children: Array<Text>;
}
export interface CodeBlockElement {
  type: typeof ELEMENT_CODE_BLOCK;
  children: Array<CodeLineElement>;
  id?: string;
}
// TODO type our remaining elements
export interface OtherElement extends BaseElement {
  type: Exclude<
    ElementType,
    typeof ELEMENT_LINK | typeof ELEMENT_TABLE_INPUT | typeof ELEMENT_CODE_BLOCK
  >;
}

export type Element =
  | LinkElement
  | TableElement
  | CodeBlockElement
  | OtherElement;

export type Text = {
  text: string;
};

export type Node = Element | Text;
