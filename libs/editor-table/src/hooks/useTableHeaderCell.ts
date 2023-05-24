import {
  TableHeaderElement,
  ColumnMenuDropdown,
  TableElement,
  useTEditorRef,
  TableCellType,
  CellValueType,
} from '@decipad/editor-types';
import { useMemo } from 'react';
import { useComputer, useIsEditorReadOnly } from '@decipad/react-contexts';
import { useNodePath } from '@decipad/editor-hooks';
import { getNode } from '@udecode/plate';
import { Path } from 'slate';
import { useSelected } from 'slate-react';
import { ConnectDragSource, ConnectDropTarget } from 'react-dnd';
import { Unit } from '@decipad/computer';
import { DropDirection } from '@decipad/editor-components';
import { useDragColumn } from './useDragColumn';
import { useColumnDropDirection, useDropColumn, useTableActions } from '.';
import { useTableHeaderCellDropdownNames } from './useTableHeaderCellDropdownNames';
import { useTableHeaderCellColumnInferredType } from './useTableHeaderCellColumnInferredType';

const getColumnDropDirection = (dir: DropDirection) =>
  dir == null || dir === 'left' || dir === 'right' ? dir : undefined;

export interface UseTableHeaderCellResult {
  readOnly: boolean;
  focused: boolean;
  onChangeColumnType: (columnIndex: number, cellType?: TableCellType) => void;
  onRemoveColumn: (columnId: string) => void;
  dragSource: ConnectDragSource;
  isDragging: boolean;
  isOver: boolean;
  dropTarget: ConnectDropTarget;
  dropDirection: 'left' | 'right' | undefined;
  parseUnit: (text: string) => Promise<Unit[] | null>;
  columnIndex: number | undefined;
  path: Path | undefined;
  inferredType: CellValueType | undefined;
  dropDownNames: ColumnMenuDropdown[];
}

export const useTableHeaderCell = (
  element: TableHeaderElement
): UseTableHeaderCellResult => {
  const computer = useComputer();
  const editor = useTEditorRef();
  const path = useNodePath(element);
  const columnIndex = path?.[path.length - 1];
  const tablePath = path && Path.parent(Path.parent(path));
  const table = tablePath && getNode<TableElement>(editor, tablePath);
  const { onChangeColumnType, onRemoveColumn } = useTableActions(editor, table);
  const focused = useSelected();
  const readOnly = useIsEditorReadOnly();

  const { dragSource, isDragging } = useDragColumn(editor, element);
  const [{ isOver }, dropTarget] = useDropColumn(editor, element);
  const dropDirection = useColumnDropDirection(editor, element);

  const parseUnit = useMemo(
    () => computer.getUnitFromText.bind(computer),
    [computer]
  );

  const dropDownNames = useTableHeaderCellDropdownNames(element, path);

  const inferredType = useTableHeaderCellColumnInferredType(
    element,
    columnIndex
  );

  return useMemo(
    () => ({
      readOnly,
      focused,
      onChangeColumnType,
      onRemoveColumn,
      dragSource,
      isDragging,
      isOver,
      dropTarget,
      dropDirection: getColumnDropDirection(dropDirection),
      parseUnit,
      columnIndex,
      path,
      inferredType,
      dropDownNames,
    }),
    [
      columnIndex,
      dragSource,
      dropDirection,
      dropDownNames,
      dropTarget,
      focused,
      inferredType,
      isDragging,
      isOver,
      onChangeColumnType,
      onRemoveColumn,
      parseUnit,
      path,
      readOnly,
    ]
  );
};
