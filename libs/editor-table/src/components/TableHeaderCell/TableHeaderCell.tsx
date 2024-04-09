import { useCallback } from 'react';
import type { PlateComponent, TableCellType } from '@decipad/editor-types';
import { ELEMENT_TH, useMyEditorRef } from '@decipad/editor-types';
import { TableColumnHeader } from '@decipad/ui';
import {
  assertElementType,
  getResultErrorMessage,
} from '@decipad/editor-utils';
import { getNodeString } from '@udecode/plate-common';
import { selectErrorFromResult } from '@decipad/remote-computer';
import { useComputer } from '@decipad/react-contexts';
import { useSelection } from '@decipad/editor-hooks';
import { selectColumn } from '../../utils/selectColumn';
import { useTableHeaderCell } from '../../hooks/useTableHeaderCell';
import { useIsFormulaSelected } from '../../hooks/useIsFormulaSelected';

const errorDebounceMs = 500;

export const TableHeaderCell: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  assertElementType(element, ELEMENT_TH);
  const editor = useMyEditorRef();

  const errorResult = useComputer().getBlockIdResult$.useWithSelectorDebounced(
    errorDebounceMs,
    selectErrorFromResult,
    element.id
  );

  const formulaIsSelected = useIsFormulaSelected(element.id);
  const isHeaderSelected = useSelection();

  const {
    readOnly,
    focused,
    onChangeColumnType,
    onAddColumnHere,
    onRemoveColumn,
    onPopulateColumn,
    dragSource,
    isDragging,
    isOver,
    dropTarget,
    dropDirection,
    parseUnit,
    columnIndex,
    path,
    inferredType,
    dropDownNames,
    width,
    setWidth,
  } = useTableHeaderCell(element) ?? {};

  return (
    <TableColumnHeader
      attributes={attributes}
      readOnly={readOnly}
      width={width}
      setWidth={setWidth}
      empty={getNodeString(element).length === 0}
      focused={focused}
      isFirst={columnIndex === 0}
      onChangeColumnType={useCallback(
        (newType?: TableCellType) =>
          columnIndex != null && onChangeColumnType?.(columnIndex, newType),
        [columnIndex, onChangeColumnType]
      )}
      onAddColRight={useCallback(
        () => columnIndex && onAddColumnHere?.(columnIndex),
        [columnIndex, onAddColumnHere]
      )}
      onAddColLeft={useCallback(
        () => columnIndex && onAddColumnHere?.(columnIndex, true),
        [columnIndex, onAddColumnHere]
      )}
      onRemoveColumn={useCallback(
        () => onRemoveColumn?.(element.id),
        [element.id, onRemoveColumn]
      )}
      onPopulateColumn={useCallback(
        () => onPopulateColumn?.(element.id),
        [element.id, onPopulateColumn]
      )}
      onSelectColumn={useCallback(
        () => path && selectColumn(editor, path),
        [editor, path]
      )}
      parseUnit={parseUnit}
      type={
        element.cellType?.kind === 'anything' &&
        inferredType?.kind !== 'type-error'
          ? inferredType
          : element.cellType
      }
      draggable={true}
      dragSource={dragSource}
      dropTarget={dropTarget}
      draggingOver={!isDragging && isOver}
      dropDirection={dropDirection}
      dropdownNames={dropDownNames}
      key={element.id}
      error={
        (errorResult &&
          !formulaIsSelected &&
          !isHeaderSelected &&
          getResultErrorMessage(errorResult)) ||
        undefined
      }
    >
      {children}
    </TableColumnHeader>
  );
};
