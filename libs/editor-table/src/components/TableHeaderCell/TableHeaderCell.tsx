import {
  ELEMENT_TH,
  PlateComponent,
  TableElement,
} from '@decipad/editor-types';
import { useComputer } from '@decipad/react-contexts';
import { organisms } from '@decipad/ui';
import { usePlateEditorRef } from '@udecode/plate';
import { Editor, Node, NodeEntry, Path } from 'slate';
import { ReactEditor, useReadOnly, useSelected } from 'slate-react';
import { useTableActions } from '../../hooks';

export const TableHeaderCell: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  if (element?.type !== ELEMENT_TH) {
    throw new Error('TableHeaderCell is meant to render table header cells');
  }
  const editor = usePlateEditorRef();
  const computer = useComputer();
  const readOnly = useReadOnly();
  const path = ReactEditor.findPath(editor, element);
  const nThChild = path[path.length - 1];
  const tablePath = Path.parent(Path.parent(path));
  const [table] = Editor.node(editor, tablePath) as NodeEntry<TableElement>;
  const { onChangeColumnType, onRemoveColumn } = useTableActions(editor, table);
  const focused = useSelected();

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
    >
      {children}
    </organisms.TableColumnHeader>
  );
};
