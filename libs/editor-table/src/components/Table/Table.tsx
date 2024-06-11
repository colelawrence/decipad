import { DraggableBlock } from '@decipad/editor-components';
import { useComputer, useNodePath } from '@decipad/editor-hooks';
import type { PlateComponent, UserIconKey } from '@decipad/editor-types';
import { ELEMENT_TABLE, useMyEditorRef } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import type { EditorTableContextValue } from '@decipad/react-contexts';
import {
  EditorTableContext,
  EditorTableResultContext,
  useCurrentWorkspaceStore,
  useEditorStylesContext,
} from '@decipad/react-contexts';
import type { AvailableSwatchColor } from '@decipad/ui';
import { EditorTable } from '@decipad/ui';
import { useCallback, useMemo, useState } from 'react';
import { defaultTableResultValue } from '../../../../react-contexts/src/editor-table-result';
import { WIDE_MIN_COL_COUNT } from '../../constants';
import { useTableStore } from '../../contexts/tableStore';
import { useTable, useTableActions } from '../../hooks';
import { selectTableResult } from '../../utils/selectTableResult';
import { SmartRow } from '../SmartRow';
import { TableDndProvider } from '../TableDndProvider/TableDndProvider';
import { useSelectedCells } from './useSelectedCells';

export const Table: PlateComponent = ({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_TABLE);

  const editor = useMyEditorRef();

  const [tableFrozen, setTableFrozen] = useState(false);
  const {
    onAddRow,
    onAddColumn,
    onChangeColumnAggregation,
    onSetCollapsed,
    onSetHideFormulas,
    onSetHideCellFormulas,
    onSaveColor,
    onSaveIcon,
    onDownload,
  } = useTableActions(editor, element);
  const selectedCells = useTableStore().get.selectedCells();

  useSelectedCells();

  const { name, columns, headers } = useTable(element);
  const blockId = element.id;

  const contextValue: EditorTableContextValue = useMemo(
    () => ({
      blockId,
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
  const tablePath = useNodePath(element);

  const wideTable = columns.length >= WIDE_MIN_COL_COUNT;

  const { color: defaultColor } = useEditorStylesContext();

  const { workspaceInfo } = useCurrentWorkspaceStore();

  return (
    <DraggableBlock
      element={element}
      blockKind={wideTable ? 'editorWideTable' : 'editorTable'}
      {...attributes}
      suppressContentEditableWarning
      id={blockId}
      dependencyId={blockId}
      key={blockId}
      isDownloadable
      onDownload={onDownload}
      needsUpgrade={!workspaceInfo.isPremium}
    >
      <EditorTableContext.Provider value={contextValue}>
        <EditorTableResultContext.Provider
          value={tableResult ?? defaultTableResultValue}
        >
          <TableDndProvider editor={editor} table={element}>
            <EditorTable
              id={element.id}
              onChangeIcon={onSaveIcon}
              onChangeColor={onSaveColor}
              onSetCollapsed={onSetCollapsed}
              hideFormulas={element.hideFormulas}
              onSetHideFormulas={onSetHideFormulas}
              hideCellFormulas={element.hideCellFormulas}
              onSetHideCellFormulas={onSetHideCellFormulas}
              icon={(element.icon ?? 'TableSmall') as UserIconKey}
              color={(element.color ?? defaultColor) as AvailableSwatchColor}
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
      </EditorTableContext.Provider>
    </DraggableBlock>
  );
};
