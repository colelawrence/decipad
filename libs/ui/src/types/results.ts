import { Result, SerializedType, SerializedTypeKind } from '@decipad/computer';
import { DragEvent } from 'react';

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
    data: DragCellData
  ) => (e: DragEvent<HTMLDivElement>) => void;
}
