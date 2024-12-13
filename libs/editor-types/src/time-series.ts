import type {
  BaseElement,
  DataViewCaptionElement,
  DataViewFilter,
  EmptyText,
  TableCellType,
} from '.';
import type {
  ELEMENT_TIME_SERIES,
  ELEMENT_TIME_SERIES_TH,
  ELEMENT_TIME_SERIES_TR,
} from './element-kinds';

export interface TimeSeriesHeaderRowElement extends BaseElement {
  type: typeof ELEMENT_TIME_SERIES_TR;
  children: Array<TimeSeriesHeader>;
}

export interface TimeSeriesHeader extends BaseElement {
  type: typeof ELEMENT_TIME_SERIES_TH;
  cellType: TableCellType;
  aggregation?: string;
  rounding?: string;
  filter?: DataViewFilter;
  name: string;
  label: string;
  children: [EmptyText];
}

export interface TimeSeriesElement extends BaseElement {
  type: typeof ELEMENT_TIME_SERIES;
  children: [DataViewCaptionElement, TimeSeriesHeaderRowElement];
  expandedGroups?: string[];
  rotate?: boolean;
  alternateRotation?: boolean;
  varName?: string;
  color?: string;
  icon?: string;
}
