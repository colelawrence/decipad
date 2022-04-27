import { useMemo, useState } from 'react';
import { ReactEditor, useSlate } from 'slate-react';
import { ELEMENT_TABLE, PlateComponent } from '@decipad/editor-types';
import { organisms } from '@decipad/ui';
import { DraggableBlock } from '@decipad/editor-components';
import { useTableActions } from '../../hooks';

export const Table: PlateComponent = ({ attributes, children, element }) => {
  if (element?.type !== ELEMENT_TABLE) {
    throw new Error('Table is meant to render table elements');
  }
  const [deleted, setDeleted] = useState(false);
  const editor = useSlate() as ReactEditor;

  const { onDelete, onAddRow } = useTableActions(editor, element);

  const tableHeaders = element.children[1].children;

  const columns = useMemo(
    () =>
      tableHeaders.map((th) => ({
        width: th.columnWidth,
        name: th.children[0].text,
        cellType: th.cellType,
      })),
    [tableHeaders]
  );

  return (
    <div {...attributes}>
      {!deleted && (
        <DraggableBlock
          element={element}
          blockKind="editorTable"
          onDelete={() => {
            setDeleted(true);
            onDelete();
          }}
        >
          <organisms.EditorTable onAddRow={onAddRow} columns={columns}>
            {children}
          </organisms.EditorTable>
        </DraggableBlock>
      )}
    </div>
  );
};
