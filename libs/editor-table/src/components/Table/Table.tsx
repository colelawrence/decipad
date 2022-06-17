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
import { AvailableSwatchColor, organisms, UserIconKey } from '@decipad/ui';
import { useMemo, useState } from 'react';
import { selectedCellsAtom, withProviders } from '@udecode/plate';
import { Provider, useAtom } from 'jotai';
import { WIDE_MIN_COL_COUNT } from '../../constants';
import {
  EditorTableContext,
  EditorTableContextValue,
} from '../../contexts/EditorTableContext';
import { useTableActions } from '../../hooks';
import { useSelectedCells } from './useSelectedCells';
import { TableDndProvider } from '../TableDndProvider/TableDndProvider';

export const tableScope = Symbol('table');

export const Table: PlateComponent = withProviders([
  Provider,
  { scope: tableScope },
])(({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_TABLE);
  const [deleted, setDeleted] = useState(false);
  const editor = useTEditorState();

  const saveIcon = useElementMutatorCallback(editor, element, 'icon');
  const saveColor = useElementMutatorCallback(editor, element, 'color');

  const { onDelete, onAddRow } = useTableActions(editor, element);
  const [selectedCells] = useAtom(selectedCellsAtom, tableScope);

  useSelectedCells();

  const tableHeaders = element.children[1].children;

  const columns = useMemo(
    () =>
      tableHeaders.map((th) => ({
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
    <div
      {...attributes}
      contentEditable={true}
      suppressContentEditableWarning
      id={blockId}
    >
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
            <TableDndProvider editor={editor} table={element}>
              <organisms.EditorTable
                onChangeIcon={saveIcon}
                onChangeColor={saveColor}
                icon={(element.icon ?? 'Table') as UserIconKey}
                color={(element.color ?? 'Catskill') as AvailableSwatchColor}
                onAddRow={onAddRow}
                columns={columns}
                tableWidth={wideTable ? 'WIDE' : 'SLIM'}
                isSelectingCell={!!selectedCells}
              >
                {children}
              </organisms.EditorTable>
            </TableDndProvider>
          </EditorTableContext.Provider>
        </DraggableBlock>
      )}
    </div>
  );
});
