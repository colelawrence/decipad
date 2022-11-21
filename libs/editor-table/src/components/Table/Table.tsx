import { DraggableBlock } from '@decipad/editor-components';
import {
  ELEMENT_TABLE,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { assertElementType, useNodePath } from '@decipad/editor-utils';
import { AvailableSwatchColor, EditorTable, UserIconKey } from '@decipad/ui';
import { useMemo, useState } from 'react';
import {
  EditorTableContext,
  EditorTableContextValue,
  useEditorStylesContext,
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

  const editor = useTEditorRef();

  const {
    onDelete,
    onAddRow,
    onAddColumn,
    onChangeColumnAggregation,
    onSetCollapsed,
    onSetHideFormulas,
    onSaveColor,
    onSaveIcon,
  } = useTableActions(editor, element);
  const selectedCells = useTableStore().get.selectedCells();

  useSelectedCells();

  const { name, columns, headers, formulas, rowCount } = useTable(element);

  const blockId = element.id;

  const contextValue: EditorTableContextValue = useMemo(() => {
    return {
      blockId,
      cellTypes: columns.map((col) => col.cellType),
      columnBlockIds: columns.map((col) =>
        col.cellType?.kind === 'table-formula'
          ? formulas.find((f) => f.columnId === col.blockId)?.id ?? ''
          : col.blockId
      ),
    };
  }, [blockId, columns, formulas]);

  const tablePath = useNodePath(element);

  const wideTable = columns.length >= WIDE_MIN_COL_COUNT;

  const { color: defaultColor } = useEditorStylesContext();

  return (
    (!deleted && (
      <DraggableBlock
        element={element}
        blockKind={wideTable ? 'editorWideTable' : 'editorTable'}
        onDelete={() => {
          setDeleted(true);
          onDelete();
        }}
        {...attributes}
        suppressContentEditableWarning
        id={blockId}
      >
        <EditorTableContext.Provider value={contextValue}>
          <TableDndProvider editor={editor} table={element}>
            <EditorTable
              onChangeIcon={onSaveIcon}
              onChangeColor={onSaveColor}
              onSetCollapsed={onSetCollapsed}
              hideFormulas={element.hideFormulas}
              onSetHideFormulas={onSetHideFormulas}
              icon={(element.icon ?? 'Table') as UserIconKey}
              color={(element.color ?? defaultColor) as AvailableSwatchColor}
              isCollapsed={element.isCollapsed}
              onAddRow={onAddRow}
              onAddColumn={onAddColumn}
              columns={columns}
              tableWidth={wideTable ? 'WIDE' : 'SLIM'}
              isSelectingCell={!!selectedCells}
              hiddenRowCount={
                element.isCollapsed
                  ? Math.max(0, rowCount - MAX_UNCOLLAPSED_TABLE_ROWS)
                  : 0
              }
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
    )) ||
    null
  );
};
