import type { Unit } from '@decipad/language-interfaces';
import {
  useComputer,
  useDragColumn,
  useNodePath,
  usePathMutatorCallback,
} from '@decipad/editor-hooks';
import type {
  CellValueType,
  ColumnMenuDropdown,
  TableCellType,
  TableElement,
  TableHeaderElement,
} from '@decipad/editor-types';
import { DRAG_ITEM_COLUMN, useMyEditorRef } from '@decipad/editor-types';
import { TableDndContext, useIsEditorReadOnly } from '@decipad/react-contexts';
import { getNode } from '@udecode/plate-common';
import { useContext, useMemo } from 'react';
import type { ConnectDragSource, ConnectDropTarget } from 'react-dnd';
import { Path } from 'slate';
import { useSelected } from 'slate-react';
import { useDebounce } from 'use-debounce';
import {
  useCellType,
  useColumnDropDirection,
  useDropColumn,
  useTableActions,
} from '.';
import { sanitizeColumnDropDirection } from '../utils';
import { useTableHeaderCellDropdownNames } from './useTableHeaderCellDropdownNames';
import { useNormalizeTableHeaderAggregation } from './useNormalizeTableHeaderAggregation';

export interface UseTableHeaderCellResult {
  readOnly: boolean;
  focused: boolean;
  onChangeColumnType: (columnIndex: number, cellType?: TableCellType) => void;
  onRemoveColumn: (columnId: string) => void;
  onPopulateColumn: (columnId: string) => void;
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
  const editor = useMyEditorRef();
  const path = useNodePath(element);
  const columnIndex = path?.[path.length - 1];
  const tablePath = path && Path.parent(Path.parent(path));
  const table = tablePath && getNode<TableElement>(editor, tablePath);
  const {
    onChangeColumnType,
    onRemoveColumn,
    onAddColumnHere,
    onPopulateColumn,
  } = useTableActions(editor, table);
  const focused = useSelected();
  const readOnly = useIsEditorReadOnly();

  const tableDnd = useContext(TableDndContext);

  const { dragSource, isDragging } = useDragColumn(
    editor,
    element,
    DRAG_ITEM_COLUMN,
    tableDnd.onCellDragEnd
  );
  const [{ isOver }, dropTarget] = useDropColumn(editor, element);
  const dropDirection = useColumnDropDirection(editor, element);

  const parseUnit = useMemo(
    () => computer.getUnitFromText.bind(computer),
    [computer]
  );

  const dropDownNames = useTableHeaderCellDropdownNames(element, path);
  const inferredType = useCellType(element);

  useNormalizeTableHeaderAggregation(element, inferredType);

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
        onPopulateColumn,
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
        onPopulateColumn,
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
