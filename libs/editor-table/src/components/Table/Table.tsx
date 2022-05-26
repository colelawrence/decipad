import { DraggableBlock } from '@decipad/editor-components';
import {
  ELEMENT_TABLE,
  PlateComponent,
  useTEditorState,
} from '@decipad/editor-types';
import {
  assertElementType,
  useElementMutatorCallback,
} from '@decipad/editor-utils';
import { organisms } from '@decipad/ui';
import { AvailableSwatchColor, UserIconKey } from 'libs/ui/src/utils';
import { useMemo, useState } from 'react';
import { WIDE_MIN_COL_COUNT } from '../../constants';
import {
  EditorTableContext,
  EditorTableContextValue,
} from '../../contexts/EditorTableContext';
import { useTableActions } from '../../hooks';

export const Table: PlateComponent = ({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_TABLE);
  const [deleted, setDeleted] = useState(false);
  const editor = useTEditorState();

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

  const wideTable = columns.length >= WIDE_MIN_COL_COUNT;

  return (
    <div {...attributes} contentEditable={true} id={blockId}>
      {!deleted && (
        <DraggableBlock
          element={element}
          blockKind={wideTable ? 'editorWideTable' : 'editorTable'}
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
