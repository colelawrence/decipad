import { useCallback } from 'react';
import {
  ELEMENT_TH,
  PlateComponent,
  TableCellType,
  useTEditorRef,
} from '@decipad/editor-types';
import { TableColumnHeader, Tooltip } from '@decipad/ui';
import { assertElementType } from '@decipad/editor-utils';
import { getNodeString } from '@udecode/plate';
import { selectColumn } from '../../utils/selectColumn';
import { useTableHeaderCell } from '../../hooks/useTableHeaderCell';

export const TableHeaderCell: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  assertElementType(element, ELEMENT_TH);
  const editor = useTEditorRef();

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
