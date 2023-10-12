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

export interface CodeResultProps<T extends SerializedTypeKind>
  extends Result.Result<T> {
  readonly parentType?: SerializedType;
  readonly variant?: 'block' | 'inline';
  readonly onDragStartCell?: (
    data: DragCellData,
    options: { previewRef?: RefObject<Element>; result: Result.Result }
  ) => (e: DragEvent<HTMLDivElement>) => void;
  readonly onDragEnd?: (e: DragEvent<HTMLDivElement>) => void;
  readonly tooltip?: boolean;
  readonly formatting?: ResultFormatting;
  readonly isLiveResult?: boolean;
  readonly isNotEditable?: boolean;
  readonly firstTableRowControls?: ReactNode;
  readonly onChangeColumnType?: (
    columnIndex: number,
    type?: SimpleTableCellType
  ) => void;
  readonly element?: AnyElement;
}
