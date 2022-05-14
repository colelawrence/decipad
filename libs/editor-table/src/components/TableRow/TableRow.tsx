import { usePlateEditorRef } from '@udecode/plate';
import { ReactEditor } from 'slate-react';
import { Editor, NodeEntry, Path } from 'slate';
import { molecules } from '@decipad/ui';
import {
  ELEMENT_TR,
  PlateComponent,
  TableElement,
} from '@decipad/editor-types';
import { useTableActions } from '../../hooks';

export const TableRow: PlateComponent = ({ attributes, children, element }) => {
  if (element?.type !== ELEMENT_TR) {
    throw new Error('TableRow is meant to render table rows');
  }
  const editor = usePlateEditorRef();
  const path = ReactEditor.findPath(editor, element);
  const tablePath = Path.parent(path);
  const [table] = Editor.node(editor, tablePath) as NodeEntry<TableElement>;
  const { onAddColumn, onRemoveRow } = useTableActions(editor, table);

  const firstRow = path[path.length - 1] === 1;
  if (firstRow) {
    return (
      <molecules.TableHeaderRow
        attributes={attributes}
        readOnly={false}
        actionsColumn={true}
        onAddColumn={onAddColumn}
      >
        {children}
      </molecules.TableHeaderRow>
    );
  }
  return (
    <molecules.TableRow
      attributes={attributes}
      readOnly={false}
      onRemove={() => onRemoveRow(element.id)}
    >
      {children}
    </molecules.TableRow>
  );
};
