import type { SerializedType } from '@decipad/language';
import { EmptyText } from '.';
import {
  ELEMENT_POWER_TABLE,
  ELEMENT_POWER_TR,
  ELEMENT_POWER_TH,
} from './element-kinds';
import type { BaseElement } from '.';
import { TableCaptionElement } from './table';

export interface PowerTableHeaderRowElement extends BaseElement {
  type: typeof ELEMENT_POWER_TR;
  children: Array<PowerTableHeader>;
}
export interface PowerTableHeader extends BaseElement {
  type: typeof ELEMENT_POWER_TH;
  cellType: SerializedType;
  aggregation?:
    | 'average'
    | 'frequency'
    | 'max'
    | 'median'
    | 'min'
    | 'span'
    | 'sum';
  name: string;
  children: [EmptyText];
}

export interface PowerTableElement extends BaseElement {
  type: typeof ELEMENT_POWER_TABLE;
  children: [TableCaptionElement, PowerTableHeaderRowElement];
  varName?: string;
  color?: string;
  icon?: string;
}
