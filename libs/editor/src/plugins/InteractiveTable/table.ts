import {
  ELEMENT_TABLE,
  ELEMENT_TH,
  ELEMENT_TR,
  ELEMENT_TD,
} from '@udecode/plate';
import {
  ELEMENT_TABLE_CAPTION,
  ELEMENT_THEAD,
  ELEMENT_TBODY,
  ELEMENT_HEAD_TR,
} from '../../utils/elementTypes';

export interface InteractiveTable {
  type: typeof ELEMENT_TABLE;
  children: [TableCaption, Thead, Tbody];
}

export interface TableCaption {
  type: typeof ELEMENT_TABLE_CAPTION;
  children: [{ text: string }];
}
export interface Thead {
  type: typeof ELEMENT_THEAD;
  children: [HeadTr];
}
export interface Tbody {
  type: typeof ELEMENT_TBODY;
  children: BodyTr[];
}

// Column names
export interface HeadTr {
  type: typeof ELEMENT_HEAD_TR;
  children: Th[];
}
export interface Th {
  type: typeof ELEMENT_TH;
  children: [{ text: string }];
}

// Table data
export interface BodyTr {
  type: typeof ELEMENT_TR;
  children: Td[];
}
export interface Td {
  type: typeof ELEMENT_TD;
  children: [{ text: string }];
}
