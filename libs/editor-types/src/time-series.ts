import type {
  BaseElement,
  EmptyText,
  TableCaptionElement,
  TableCellType,
  Text,
} from '.';
import type {
  ELEMENT_TIME_SERIES,
  ELEMENT_TIME_SERIES_CAPTION,
  ELEMENT_TIME_SERIES_NAME,
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
  filter?: TimeSeriesFilter;
  name: string;
  label: string;
  children: [EmptyText];
}

export interface TimeSeriesNameElement extends BaseElement {
  type: typeof ELEMENT_TIME_SERIES_NAME;
  children: [Text];
}

export interface TimeSeriesCaptionElement extends BaseElement {
  type: typeof ELEMENT_TIME_SERIES_CAPTION;
  children: [TimeSeriesNameElement];
}

export interface TimeSeriesElement extends BaseElement {
  type: typeof ELEMENT_TIME_SERIES;
  children: [TimeSeriesCaptionElement, TimeSeriesHeaderRowElement];
  expandedGroups?: string[];
  rotate?: boolean;
  alternateRotation?: boolean;
  varName?: string;
  color?: string;
  icon?: string;
}

export interface OldTimeSeriesElement extends BaseElement {
  type: typeof ELEMENT_TIME_SERIES;
  children: [TableCaptionElement, TimeSeriesHeaderRowElement];
  rotate?: boolean;
  alternateRotation?: boolean;
  varName?: string;
  color?: string;
  icon?: string;
}

// eq = equal
// ne = not equal
// bt = between

export type TimeSeriesStringOperation = 'in';
export type TimeSeriesNumberOperation = 'eq' | 'ne' | 'bt';
export type TimeSeriesDateOperation = 'eq' | 'ne' | 'bt';
export type TimeSeriesBooleanOperation = 'eq';
export type TimeSeriesFilter =
  | {
      operation: TimeSeriesStringOperation;
      // valueOrValues is not optional as empty array serves as undefined
      valueOrValues: string[];
    }
  | {
      operation: Exclude<TimeSeriesNumberOperation, 'bt'>;
      valueOrValues?: number;
    }
  | {
      operation: Exclude<TimeSeriesDateOperation, 'bt'>;
      valueOrValues?: string;
    }
  | {
      operation: 'bt';
      // fixed length of 2 [from, to]
      valueOrValues?:
        | [number | undefined, number | undefined]
        | [string | undefined, string | undefined];
    }
  | {
      operation: TimeSeriesBooleanOperation;
      valueOrValues: boolean;
    };

export type TimeSeriesOperation =
  | TimeSeriesStringOperation
  | TimeSeriesNumberOperation
  | TimeSeriesDateOperation
  | TimeSeriesBooleanOperation;
