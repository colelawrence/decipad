import { findNodePath, getNodeEntry } from '@udecode/plate';
import { Path } from 'slate';
import { molecules } from '@decipad/ui';
import {
  ELEMENT_TR,
  PlateComponent,
  TableElement,
  useTPlateEditorRef,
} from '@decipad/editor-types';
import { useTableActions } from '../../hooks';

export const TableRow: PlateComponent = ({ attributes, children, element }) => {
  if (element?.type !== ELEMENT_TR) {
    throw new Error('TableRow is meant to render table rows');
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const editor = useTPlateEditorRef()!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const path = findNodePath(editor, element)!;
  const tablePath = Path.parent(path);
  const [table] = getNodeEntry<TableElement>(editor, tablePath);
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
