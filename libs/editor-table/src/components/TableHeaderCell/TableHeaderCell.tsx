import {
  ELEMENT_TH,
  PlateComponent,
  TableElement,
} from '@decipad/editor-types';
import { useComputer } from '@decipad/react-contexts';
import { organisms } from '@decipad/ui';
import { findPath } from '@decipad/editor-utils';
import { usePlateEditorRef } from '@udecode/plate';
import { Editor, Node, NodeEntry, Path } from 'slate';
import { useReadOnly, useSelected } from 'slate-react';
import { useTableActions, useDragColumn, useDropColumn } from '../../hooks';

export const TableHeaderCell: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  if (element?.type !== ELEMENT_TH) {
    throw new Error('TableHeaderCell is meant to render table header cells');
  }
  const editor = usePlateEditorRef();
  const path = findPath(editor, element);
  if (!path) {
    throw new Error('no path for th element found');
  }
  const computer = useComputer();
  const readOnly = useReadOnly();
  const nThChild = path[path.length - 1];
  const tablePath = Path.parent(Path.parent(path));
  const [table] = Editor.node(editor, tablePath) as NodeEntry<TableElement>;
  const { onChangeColumnType, onRemoveColumn } = useTableActions(editor, table);
  const focused = useSelected();
  const [{ isDragging }, dragSource, dragPreview] = useDragColumn(
    editor,
    element.id
  );
  const [{ isOver, overDirection }, dropTarget] = useDropColumn(
    editor,
    table,
    element
  );

  return (
    <organisms.TableColumnHeader
      attributes={attributes}
      readOnly={readOnly}
      empty={Node.string(element).length === 0}
      focused={focused}
      isFirst={nThChild === 0}
      onChangeColumnType={(type) => onChangeColumnType(nThChild, type)}
      onRemoveColumn={() => onRemoveColumn(element.id)}
      parseUnit={computer.getUnitFromText.bind(computer)}
      type={element.cellType}
      dragSource={dragSource}
      dropTarget={dropTarget}
      dragPreview={dragPreview}
      draggingOver={!isDragging && isOver}
      dropDirection={overDirection}
    >
      {children}
    </organisms.TableColumnHeader>
  );
};
