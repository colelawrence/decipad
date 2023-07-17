/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useState } from 'react';
import { SerializedType } from '@decipad/computer';
import {
  ELEMENT_TD,
  ELEMENT_TH,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { isElementOfType } from '@decipad/editor-utils';
import { CodeResult, FormulaTableData, TableData } from '@decipad/ui';
import { dndStore } from '@udecode/plate-dnd';
import { useColumnDropDirection } from '../../hooks';
import { useTableCell } from '../../hooks/useTableCell';
import { sanitizeColumnDropDirection } from '../../utils';
import { isCellAlignRight } from '../../utils/isCellAlignRight';
import { TableCellDropColumnEffect } from './TableCellDropColumnEffect';

export const TableCell: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  const [tableDataElement, tableDataRef] =
    useState<HTMLTableCellElement | null>(null);

  if (
    !isElementOfType(element, ELEMENT_TH) &&
    !isElementOfType(element, ELEMENT_TD)
  ) {
    throw new Error(
      `TableCell is meant to render table cells, not ${element?.type}`
    );
  }

  const {
    formulaResult,
    selected,
    editable,
    disabled,
    selectedCells,
    focused,
    unit,
    cellType,
    nodeText,
    onChangeValue,
    collapsed,
    showParseError,
    parseErrorMessage,
    dropdownOptions,
    dropdownResult,
    width,
  } = useTableCell(element);

  const editor = useTEditorRef();
  const dropDirection = useColumnDropDirection(editor, element);
  const isDragging = dndStore.use.isDragging();

  if (cellType?.kind === 'table-formula') {
    // IMPORTANT NOTE: do not remove the children elements from rendering.
    // Even though they're one element with an empty text property, their absence triggers
    // an uncaught exception in slate-react.
    // Also, be careful with the element structure:
    // https://github.com/ianstormtaylor/slate/issues/3930#issuecomment-723288696
    return (
      <FormulaTableData
        result={
          formulaResult && (
            <CodeResult
              parentType={{ kind: 'table' } as SerializedType}
              {...formulaResult}
              element={element}
            />
          )
        }
        resultType={formulaResult && formulaResult.type.kind}
        {...attributes}
        selected={selected}
        dropDirection={sanitizeColumnDropDirection(dropDirection)}
      >
        {children}
      </FormulaTableData>
    );
  }

  return (
    <>
      {isDragging && (
        <TableCellDropColumnEffect
          element={element}
          dropTarget={tableDataElement}
        />
      )}

      <TableData
        ref={tableDataRef}
        isEditable={editable}
        disabled={disabled}
        width={width}
        isUserContent
        as="td"
        attributes={attributes}
        selected={selected}
        focused={selectedCells && selectedCells.length > 1 ? false : focused}
        collapsed={collapsed}
        unit={unit}
        type={cellType}
        value={nodeText}
        onChangeValue={onChangeValue}
        alignRight={isCellAlignRight(cellType)}
        parseError={showParseError ? parseErrorMessage : undefined}
        dropDirection={sanitizeColumnDropDirection(dropDirection)}
        dropdownOptions={{
          dropdownOptions,
          dropdownResult,
        }}
        element={element}
      >
        {children}
      </TableData>
    </>
  );
};
