import { Unit } from '@decipad/computer';
import { useNodePath, usePathMutatorCallback } from '@decipad/editor-hooks';
import {
  CellValueType,
  ColumnMenuDropdown,
  TableCellType,
  TableElement,
  TableHeaderElement,
  useTEditorRef,
} from '@decipad/editor-types';
import { useComputer, useIsEditorReadOnly } from '@decipad/react-contexts';
import { getNode } from '@udecode/plate';
import { useMemo } from 'react';
import { ConnectDragSource, ConnectDropTarget } from 'react-dnd';
import { Path } from 'slate';
import { useSelected } from 'slate-react';
import { useDebounce } from 'use-debounce';
import { useColumnDropDirection, useDropColumn, useTableActions } from '.';
import { DRAG_ITEM_COLUMN } from '../contexts/TableDndContext';
import { sanitizeColumnDropDirection } from '../utils';
import { useDragColumn } from './useDragColumn';
import { useTableHeaderCellColumnInferredType } from './useTableHeaderCellColumnInferredType';
import { useTableHeaderCellDropdownNames } from './useTableHeaderCellDropdownNames';

export interface UseTableHeaderCellResult {
  readOnly: boolean;
  focused: boolean;
  onChangeColumnType: (columnIndex: number, cellType?: TableCellType) => void;
  onRemoveColumn: (columnId: string) => void;
  onAddColumnHere: (columnIndex: number, left?: boolean) => void;
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
  width?: number;
  setWidth: (width: number) => void;
}

export const useTableHeaderCell = (
  element: TableHeaderElement
): UseTableHeaderCellResult | undefined => {
  const computer = useComputer();
  const editor = useTEditorRef();
  const path = useNodePath(element);
  const columnIndex = path?.[path.length - 1];
  const tablePath = path && Path.parent(Path.parent(path));
  const table = tablePath && getNode<TableElement>(editor, tablePath);
  const { onChangeColumnType, onRemoveColumn, onAddColumnHere } =
    useTableActions(editor, table);
  const focused = useSelected();
  const readOnly = useIsEditorReadOnly();

  const { dragSource, isDragging } = useDragColumn(
    editor,
    element,
    DRAG_ITEM_COLUMN
  );
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

  const { width } = element;
  const setWidth = usePathMutatorCallback(editor, path, 'width', 'TableHeader');

  return useDebounce(
    useMemo(
      () => ({
        readOnly,
        focused,
        onChangeColumnType,
        onAddColumnHere,
        onRemoveColumn,
        dragSource,
        isDragging,
        isOver,
        dropTarget,
        dropDirection: sanitizeColumnDropDirection(dropDirection),
        parseUnit,
        columnIndex,
        path,
        inferredType,
        dropDownNames,
        width,
        setWidth,
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
        onAddColumnHere,
        onRemoveColumn,
        parseUnit,
        path,
        readOnly,
        width,
        setWidth,
      ]
    ),
    100
  )[0];
};
