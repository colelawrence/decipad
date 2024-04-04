import type { BaseElement, EmptyText, TableCellType, Text } from '.';
import type {
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
  cellType: TableCellType;
  aggregation?: string;
  rounding?: string;
  filter?: DataViewFilter;
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

// eq = equal
// ne = not equal
// bt = between

export type DataViewStringOperation = 'in';
export type DataViewNumberOperation = 'eq' | 'ne' | 'bt';
export type DataViewDateOperation = 'eq' | 'ne' | 'bt';
export type DataViewBooleanOperation = 'eq';
export type DataViewFilter =
  | {
      operation: DataViewStringOperation;
      // valueOrValues is not optional as empty array serves as undefined
      valueOrValues: string[];
    }
  | {
      operation: Exclude<DataViewNumberOperation, 'bt'>;
      valueOrValues?: number;
    }
  | {
      operation: Exclude<DataViewDateOperation, 'bt'>;
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
      operation: DataViewBooleanOperation;
      valueOrValues: boolean;
    };

export type DataViewOperation =
  | DataViewStringOperation
  | DataViewNumberOperation
  | DataViewDateOperation
  | DataViewBooleanOperation;
