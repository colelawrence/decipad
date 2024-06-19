import type {
  Result,
  SerializedType,
  SerializedTypeKind,
} from '@decipad/remote-computer';
import { AnyElement, SimpleTableCellType } from '@decipad/editor-types';
import { DragEvent, ReactNode, RefObject } from 'react';

export interface DragCellData {
  tableName: string;
  columnName: string;
  cellValue: string;
}

export type ResultFormatting =
  | 'automatic'
  | 'precise'
  | 'financial'
  | 'scientific';

export interface CodeResultProps<T extends SerializedTypeKind> {
  readonly type: Result.Result<T>['type'];
  readonly value: Result.Result<T>['value'];
  readonly parentType?: SerializedType;
  readonly variant?: 'block' | 'inline';
  readonly expanded?: boolean;
  readonly onDragStartCell?: (
    data: DragCellData,
    options: { previewRef?: RefObject<Element>; result: Result.Result }
  ) => (e: DragEvent<HTMLDivElement>) => void;
  readonly onDragEnd?: (e: DragEvent<HTMLDivElement>) => void;
  readonly tooltip?: boolean;
  readonly formatting?: ResultFormatting;
  readonly isLiveResult?: boolean;
  readonly isResultPreview?: boolean;
  readonly isNotEditable?: boolean;
  readonly firstTableRowControls?: ReactNode;
  readonly onChangeColumnType?: (
    columnIndex: number,
    type?: SimpleTableCellType
  ) => void;
  readonly onHideColumn?: (columnName: string) => void;
  readonly element?: AnyElement;
  readonly blockId?: string;
}
