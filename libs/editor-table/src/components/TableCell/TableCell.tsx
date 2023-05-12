/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ELEMENT_TD, ELEMENT_TH, PlateComponent } from '@decipad/editor-types';
import { isElementOfType } from '@decipad/editor-utils';
import { CodeResult, FormulaTableData, TableData } from '@decipad/ui';
import { useTableCell } from '../../hooks/useTableCell';
import { isCellAlignRight } from '../../utils/isCellAlignRight';

export const TableCell: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
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
    dropTarget,
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
  } = useTableCell(element);

  if (cellType?.kind === 'table-formula') {
    if (!formulaResult) {
      return <td></td>;
    }
    // IMPORTANT NOTE: do not remove the children elements from rendering.
    // Even though they're one element with an empty text property, their absence triggers
    // an uncaught exception in slate-react.
    // Also, be careful with the element structure:
    // https://github.com/ianstormtaylor/slate/issues/3930#issuecomment-723288696
    return (
      <FormulaTableData
        result={<CodeResult {...formulaResult} element={element} />}
        resultType={formulaResult.type.kind}
        {...attributes}
        selected={selected}
      >
        {children}
      </FormulaTableData>
    );
  }

  return (
    <TableData
      isEditable={editable}
      disabled={disabled}
      isUserContent
      as="td"
      attributes={attributes}
      dropTarget={dropTarget}
      selected={selected}
      focused={selectedCells && selectedCells.length > 1 ? false : focused}
      collapsed={collapsed}
      unit={unit}
      type={cellType}
      value={nodeText}
      onChangeValue={onChangeValue}
      alignRight={isCellAlignRight(cellType)}
      parseError={showParseError ? parseErrorMessage : undefined}
      dropdownOptions={{
        dropdownOptions,
        dropdownResult,
      }}
      element={element}
    >
      {children}
    </TableData>
  );
};
