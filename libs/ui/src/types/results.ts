import { Result, SerializedType, SerializedTypeKind } from '@decipad/computer';
import { AnyElement, TableCellType } from '@decipad/editor-types';
import { DragEvent, ReactNode, RefObject } from 'react';

export interface DragCellData {
  tableName: string;
  columnName: string;
  cellValue: string;
}

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
  readonly isLiveResult?: boolean;
  readonly firstTableRowControls?: ReactNode;
  readonly onChangeColumnType?: (
    columnIndex: number,
    type: TableCellType
  ) => void;
  readonly element?: AnyElement;
}
