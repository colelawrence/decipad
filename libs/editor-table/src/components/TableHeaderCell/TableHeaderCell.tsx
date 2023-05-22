import { useCallback } from 'react';
import {
  ELEMENT_TH,
  PlateComponent,
  TableCellType,
  useTEditorRef,
} from '@decipad/editor-types';
import { TableColumnHeader, Tooltip, CodeLine } from '@decipad/ui';
import { assertElementType } from '@decipad/editor-utils';
import { getNodeString } from '@udecode/plate';
import { selectErrorFromResult } from '@decipad/computer';
import { useComputer } from '@decipad/react-contexts';
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
  const editor = useTEditorRef();

  const errorResult = useComputer().getBlockIdResult$.useWithSelectorDebounced(
    errorDebounceMs,
    selectErrorFromResult,
    element.id
  );

  const formulaIsSelected = useIsFormulaSelected(element.id);

  const {
    readOnly,
    focused,
    onChangeColumnType,
    onRemoveColumn,
    dragSource,
    isDragging,
    isOver,
    dropTarget,
    dropDirection,
    parseUnit,
    errorMessage,
    columnIndex,
    path,
    inferredType,
    dropDownNames,
  } = useTableHeaderCell(element);

  return (
    <Tooltip
      trigger={
        <TableColumnHeader
          attributes={attributes}
          readOnly={readOnly}
          empty={getNodeString(element).length === 0}
          focused={focused}
          isFirst={columnIndex === 0}
          onChangeColumnType={useCallback(
            (newType?: TableCellType) =>
              columnIndex != null && onChangeColumnType(columnIndex, newType),
            [columnIndex, onChangeColumnType]
          )}
          onRemoveColumn={useCallback(
            () => onRemoveColumn(element.id),
            [element.id, onRemoveColumn]
          )}
          onSelectColumn={useCallback(
            () => path && selectColumn(editor, path),
            [editor, path]
          )}
          parseUnit={parseUnit}
          type={
            element.cellType?.kind === 'anything'
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
            errorResult &&
            !formulaIsSelected && (
              <CodeLine variant="table" result={errorResult} element={element}>
                {' '}
              </CodeLine>
            )
          }
        >
          {children}
        </TableColumnHeader>
      }
      open={errorMessage != null}
    >
      {errorMessage}
    </Tooltip>
  );
};
