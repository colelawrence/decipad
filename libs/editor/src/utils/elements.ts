import { ELEMENT_LINK } from '@udecode/plate';
import { ElementType, ELEMENT_TABLE_INPUT } from './elementTypes';
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
// TODO type our remaining elements
export interface OtherElement extends BaseElement {
  type: Exclude<ElementType, typeof ELEMENT_LINK | typeof ELEMENT_TABLE_INPUT>;
}

export type Element = LinkElement | TableElement | OtherElement;

export type Text = {
  text: string;
};

export type Node = Element | Text;
