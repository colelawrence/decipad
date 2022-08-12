import type { SerializedType } from '@decipad/language';
import { EmptyText } from '.';
import {
  ELEMENT_DATA_VIEW,
  ELEMENT_DATA_VIEW_TR,
  ELEMENT_DATA_VIEW_TH,
} from './element-kinds';
import type { BaseElement } from '.';
import { TableCaptionElement } from './table';

export interface DataViewHeaderRowElement extends BaseElement {
  type: typeof ELEMENT_DATA_VIEW_TR;
  children: Array<DataViewHeader>;
}
export interface DataViewHeader extends BaseElement {
  type: typeof ELEMENT_DATA_VIEW_TH;
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

export interface DataViewElement extends BaseElement {
  type: typeof ELEMENT_DATA_VIEW;
  children: [TableCaptionElement, DataViewHeaderRowElement];
  varName?: string;
  color?: string;
  icon?: string;
}
