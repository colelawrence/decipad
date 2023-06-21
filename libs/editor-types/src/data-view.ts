import type { SerializedType } from '@decipad/language';
import type { BaseElement } from '.';
import { EmptyText, Text } from '.';
import {
  ELEMENT_DATA_VIEW,
  ELEMENT_DATA_VIEW_CAPTION,
  ELEMENT_DATA_VIEW_NAME,
  ELEMENT_DATA_VIEW_TH,
  ELEMENT_DATA_VIEW_TR,
} from './element-kinds';

export interface DataViewHeaderRowElement extends BaseElement {
  type: typeof ELEMENT_DATA_VIEW_TR;
  children: Array<DataViewHeader>;
}

export interface DataViewHeader extends BaseElement {
  type: typeof ELEMENT_DATA_VIEW_TH;
  cellType: SerializedType;
  aggregation?: 'average' | 'max' | 'median' | 'min' | 'span' | 'sum';
  rounding?: string;
  name: string;
  label: string;
  children: [EmptyText];
}

export interface DataViewNameElement extends BaseElement {
  type: typeof ELEMENT_DATA_VIEW_NAME;
  children: [Text];
}

export interface DataViewCaptionElement extends BaseElement {
  type: typeof ELEMENT_DATA_VIEW_CAPTION;
  children: [DataViewNameElement];
}

export interface DataViewElement extends BaseElement {
  type: typeof ELEMENT_DATA_VIEW;
  children: [DataViewCaptionElement, DataViewHeaderRowElement];
  expandedGroups?: string[];
  rotate?: boolean;
  alternateRotation?: boolean;
  varName?: string;
  color?: string;
  icon?: string;
}
