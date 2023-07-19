import { Result } from '@decipad/computer';
import { DraggableBlock } from '@decipad/editor-components';
import { useNodePath } from '@decipad/editor-hooks';
import {
  ELEMENT_TABLE,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  useMaterializedResult,
} from '@decipad/editor-utils';
import {
  EditorTableContext,
  EditorTableContextValue,
  EditorTableResultContext,
  useComputer,
  useEditorStylesContext,
} from '@decipad/react-contexts';
import { AvailableSwatchColor, EditorTable, UserIconKey } from '@decipad/ui';
import { useCallback, useMemo, useState } from 'react';
import { defaultTableResultValue } from '../../../../react-contexts/src/editor-table-result';
import { WIDE_MIN_COL_COUNT } from '../../constants';
import {
  ColumnInferredTypeContext,
  createDefaultColumnInferredTypeContextValue,
} from '../../contexts/ColumnInferredTypeContext';
import { useTableStore } from '../../contexts/tableStore';
import { useTable, useTableActions } from '../../hooks';
import { selectTableResult } from '../../utils/selectTableResult';
import { SmartRow } from '../SmartRow';
import { TableDndProvider } from '../TableDndProvider/TableDndProvider';
import { useSelectedCells } from './useSelectedCells';

export const Table: PlateComponent = ({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_TABLE);
  const [deleted, setDeleted] = useState(false);

  const editor = useTEditorRef();

  const [tableFrozen, setTableFrozen] = useState(false);
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

  const { name, columns, headers } = useTable(element);
  const blockId = element.id;

  const contextValue: EditorTableContextValue = useMemo(
    () => ({
      blockId,
      columnWidths: columns.map((col) => col.width),
      cellTypes: columns.map((col) => col.cellType),
      columnBlockIds: columns.map((col) => col.blockId),
      tableFrozen,
      setTableFrozen,
    }),
    [blockId, columns, tableFrozen, setTableFrozen]
  );

  const computer = useComputer();
  const tableResult = computer.getBlockIdResult$.useWithSelector(
    useCallback(
      (blockResult) => selectTableResult(blockResult?.result, columns),
      [columns]
    ),
    blockId
  );
  const materializedTableResult = useMaterializedResult(
    tableResult as Result.AnyResult
  ) as Result.Result<'materialized-table'>;

  const tablePath = useNodePath(element);

  const wideTable = columns.length >= WIDE_MIN_COL_COUNT;

  const { color: defaultColor } = useEditorStylesContext();

  const [columnInferredTypesContextValue] = useState(
    createDefaultColumnInferredTypeContextValue
  );

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
        dependencyId={blockId}
        key={blockId}
      >
        <EditorTableContext.Provider value={contextValue}>
          <ColumnInferredTypeContext.Provider
            value={columnInferredTypesContextValue}
          >
            <EditorTableResultContext.Provider
              value={materializedTableResult ?? defaultTableResultValue}
            >
              <TableDndProvider editor={editor} table={element}>
                <EditorTable
                  id={element.id}
                  onChangeIcon={onSaveIcon}
                  onChangeColor={onSaveColor}
                  onSetCollapsed={onSetCollapsed}
                  hideFormulas={element.hideFormulas}
                  onSetHideFormulas={onSetHideFormulas}
                  icon={(element.icon ?? 'TableSmall') as UserIconKey}
                  color={
                    (element.color ?? defaultColor) as AvailableSwatchColor
                  }
                  isCollapsed={element.isCollapsed}
                  onAddRow={onAddRow}
                  onAddColumn={onAddColumn}
                  tableWidth={wideTable ? 'WIDE' : 'SLIM'}
                  isSelectingCell={!!selectedCells}
                  smartRow={
                    <SmartRow
                      onAggregationTypeNameChange={onChangeColumnAggregation}
                      aggregationTypeNames={headers.map((h) => h.aggregation)}
                      tableName={name}
                      tablePath={tablePath}
                      columns={columns}
                      element={element}
                    />
                  }
                >
                  {children}
                </EditorTable>
              </TableDndProvider>
            </EditorTableResultContext.Provider>
          </ColumnInferredTypeContext.Provider>
        </EditorTableContext.Provider>
      </DraggableBlock>
    )) ||
    null
  );
};
