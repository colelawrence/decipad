import { DraggableBlock } from '@decipad/editor-components';
import {
  ELEMENT_TABLE,
  PlateComponent,
  useTEditorState,
} from '@decipad/editor-types';
import {
  assertElementType,
  useElementMutatorCallback,
  useNodePath,
} from '@decipad/editor-utils';
import { AvailableSwatchColor, EditorTable, UserIconKey } from '@decipad/ui';
import { useMemo, useState } from 'react';
import {
  EditorTableContext,
  EditorTableContextValue,
  useIsEditorReadOnly,
} from '@decipad/react-contexts';
import {
  MAX_UNCOLLAPSED_TABLE_ROWS,
  WIDE_MIN_COL_COUNT,
} from '../../constants';
import { useTable, useTableActions } from '../../hooks';
import { useSelectedCells } from './useSelectedCells';
import { TableDndProvider } from '../TableDndProvider/TableDndProvider';
import { SmartRow } from '../SmartRow';
import { useTableStore } from '../../contexts/tableStore';

export const Table: PlateComponent = ({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_TABLE);
  const [deleted, setDeleted] = useState(false);
  const editor = useTEditorState();

  const saveIcon = useElementMutatorCallback(editor, element, 'icon');
  const saveColor = useElementMutatorCallback(editor, element, 'color');

  const { onDelete, onAddRow, onAddColumn, onChangeColumnAggregation } =
    useTableActions(editor, element);
  const selectedCells = useTableStore().get.selectedCells();

  useSelectedCells();

  const { name, columns, headers, rowCount } = useTable(element);

  const blockId = element.id;

  const readOnly = useIsEditorReadOnly();
  const [isCollapsed, setCollapsed] = useState(() => readOnly);

  const contextValue: EditorTableContextValue = useMemo(() => {
    return {
      blockId,
      cellTypes: columns.map((col) => col.cellType),
      isCollapsed,
    };
  }, [blockId, columns, isCollapsed]);

  const tablePath = useNodePath(element);

  const wideTable = columns.length >= WIDE_MIN_COL_COUNT;

  return (
    (!deleted && (
      <div
        {...attributes}
        contentEditable={true}
        suppressContentEditableWarning
        id={blockId}
      >
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
              <EditorTable
                onChangeIcon={saveIcon}
                onChangeColor={saveColor}
                icon={(element.icon ?? 'Table') as UserIconKey}
                color={(element.color ?? 'Catskill') as AvailableSwatchColor}
                onAddRow={onAddRow}
                onAddColumn={onAddColumn}
                columns={columns}
                tableWidth={wideTable ? 'WIDE' : 'SLIM'}
                isSelectingCell={!!selectedCells}
                hiddenRowCount={
                  isCollapsed
                    ? Math.max(0, rowCount - MAX_UNCOLLAPSED_TABLE_ROWS)
                    : 0
                }
                setCollapsed={setCollapsed}
                smartRow={
                  <SmartRow
                    onAggregationTypeNameChange={onChangeColumnAggregation}
                    aggregationTypeNames={headers.map((h) => h.aggregation)}
                    tableName={name}
                    tablePath={tablePath}
                    columns={columns}
                  />
                }
              >
                {children}
              </EditorTable>
            </TableDndProvider>
          </EditorTableContext.Provider>
        </DraggableBlock>
      </div>
    )) ||
    null
  );
};
