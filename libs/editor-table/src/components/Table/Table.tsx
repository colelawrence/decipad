import { DraggableBlock } from '@decipad/editor-components';
import { ELEMENT_TABLE, PlateComponent } from '@decipad/editor-types';
import { useElementMutatorCallback } from '@decipad/editor-utils';
import { organisms } from '@decipad/ui';
import { AvailableSwatchColor, UserIconKey } from 'libs/ui/src/utils';
import { useMemo, useState } from 'react';
import { ReactEditor, useSlate } from 'slate-react';
import { useTableActions } from '../../hooks';
import {
  EditorTableContext,
  EditorTableContextValue,
} from '../../contexts/EditorTableContext';

export const Table: PlateComponent = ({ attributes, children, element }) => {
  if (element?.type !== ELEMENT_TABLE) {
    throw new Error('Table is meant to render table elements');
  }
  const [deleted, setDeleted] = useState(false);
  const editor = useSlate() as ReactEditor;

  const saveIcon = useElementMutatorCallback(editor, element, 'icon');
  const saveColor = useElementMutatorCallback(editor, element, 'color');

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

  const blockId = element.id;
  const contextValue: EditorTableContextValue = useMemo(
    () => ({ blockId, cellTypes: columns.map((col) => col.cellType) }),
    [blockId, columns]
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
          <EditorTableContext.Provider value={contextValue}>
            <organisms.EditorTable
              onChangeIcon={saveIcon}
              onChangeColor={saveColor}
              icon={(element.icon ?? 'Table') as UserIconKey}
              color={(element.color ?? 'Catskill') as AvailableSwatchColor}
              onAddRow={onAddRow}
              columns={columns}
            >
              {children}
            </organisms.EditorTable>
          </EditorTableContext.Provider>
        </DraggableBlock>
      )}
    </div>
  );
};
