import { useCallback, useEffect, useMemo } from 'react';
import {
  ELEMENT_TH,
  PlateComponent,
  TableElement,
  TableHeaderElement,
  useTPlateEditorRef,
} from '@decipad/editor-types';
import { useComputer } from '@decipad/react-contexts';
import { organisms } from '@decipad/ui';
import { assertElementType } from '@decipad/editor-utils';
import {
  findNodePath,
  getNodeEntry,
  getNodeString,
  useDragNode,
} from '@udecode/plate';
import { Path } from 'slate';
import { useSelected } from 'slate-react';
import { useAtom } from 'jotai';
import { useDropColumn, useTableActions } from '../../hooks';
import { columnDropLineAtom } from '../../contexts/tableAtoms';
import { tableScope } from '../Table/index';
import { ColumnDndDirection } from '../../types';
import { useColumnDropDirection } from '../../hooks/useColumnDropDirection';
import { selectColumn } from '../../utils/selectColumn';

export const DRAG_ITEM_COLUMN = 'column';

export const TableHeaderCell: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  assertElementType(element, ELEMENT_TH);
  const computer = useComputer();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const editor = useTPlateEditorRef()!;
  const path = findNodePath(editor, element);
  if (!path) {
    throw new Error('no path for th element found');
  }
  const nThChild = path[path.length - 1];
  const tablePath = Path.parent(Path.parent(path));
  const [table] = getNodeEntry<TableElement>(editor, tablePath);
  const { onChangeColumnType, onRemoveColumn } = useTableActions(editor, table);
  const focused = useSelected();
  const [columnDropLine, setColumnDropLine] = useAtom(
    columnDropLineAtom,
    tableScope
  );
  const [{ isDragging }, dragSource, dragPreview] = useDragNode(editor, {
    id: element.id,
    type: DRAG_ITEM_COLUMN,
  });

  const dropDirection = useColumnDropDirection(editor, element);

  const onChangeDropLine = useCallback(
    (newValue: ColumnDndDirection) => {
      setColumnDropLine(
        newValue
          ? {
              direction: newValue,
              element: element as TableHeaderElement,
            }
          : null
      );
    },
    [element, setColumnDropLine]
  );

  const [{ isOver }, dropTarget] = useDropColumn(editor, {
    table,
    column: element,
    dropLine: columnDropLine?.direction,
    isDragging,
    onChangeDropLine,
  });

  useEffect(() => {
    if (!isDragging) {
      setColumnDropLine(null);
    }
  }, [isDragging, setColumnDropLine]);

  const parseUnit = useMemo(
    () => computer.getUnitFromText.bind(computer),
    [computer]
  );

  return (
    <organisms.TableColumnHeader
      attributes={attributes}
      readOnly={false}
      empty={getNodeString(element).length === 0}
      focused={focused}
      isFirst={nThChild === 0}
      onChangeColumnType={(type) => onChangeColumnType(nThChild, type)}
      onRemoveColumn={() => onRemoveColumn(element.id)}
      onSelectColumn={() => selectColumn(editor, path)}
      parseUnit={parseUnit}
      type={element.cellType}
      draggable={true}
      dragSource={dragSource}
      dropTarget={dropTarget}
      dragPreview={dragPreview}
      draggingOver={!isDragging && isOver}
      dropDirection={dropDirection}
    >
      {children}
    </organisms.TableColumnHeader>
  );
};
