import { useMemo } from 'react';
import {
  ELEMENT_TH,
  PlateComponent,
  TableElement,
  useTPlateEditorRef,
} from '@decipad/editor-types';
import { useComputer } from '@decipad/react-contexts';
import { organisms } from '@decipad/ui';
import { assertElementType } from '@decipad/editor-utils';
import { findNodePath, getNodeEntry, getNodeString } from '@udecode/plate';
import { Path } from 'slate';
import { useSelected } from 'slate-react';
import { selectColumn } from '../../utils/selectColumn';
import { useDragColumn } from '../../hooks/useDragColumn';
import {
  useDropColumn,
  useTableActions,
  useColumnDropDirection,
} from '../../hooks';

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

  const { dragSource, dragPreview, isDragging } = useDragColumn(
    editor,
    element
  );
  const [{ isOver }, dropTarget] = useDropColumn(editor, element);
  const dropDirection = useColumnDropDirection(editor, element);

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
