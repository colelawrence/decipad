/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { getExprRef } from '@decipad/computer';
import {
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_VARIABLE_DEF,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  isElementOfType,
  useSelection,
  useTableColumnFormulaResultForCell,
} from '@decipad/editor-utils';
import { useComputer } from '@decipad/react-contexts';
import { useDelayedTrue } from '@decipad/react-utils';
import { CodeResult, FormulaTableData, TableData } from '@decipad/ui';
import {
  findNodePath,
  getNodeString,
  insertText,
  isCollapsed,
} from '@udecode/plate';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelected } from 'slate-react';
import { useTableStore } from '../../contexts/tableStore';
import {
  useCellType,
  useDropColumn,
  useIsCellSelected,
  useIsColumnSelected,
} from '../../hooks';
import { isCellAlignRight } from '../../utils/isCellAlignRight';

export const TableCell: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  const editor = useTEditorRef();
  const selected = useIsCellSelected(element!);
  const focused = useSelected();
  const collapsed = isCollapsed(useSelection());
  const selectedCells = useTableStore().get.selectedCells();
  const [, dropTarget] = useDropColumn(editor, element!);

  if (
    !isElementOfType(element, ELEMENT_TH) &&
    !isElementOfType(element, ELEMENT_TD)
  ) {
    throw new Error(
      `TableCell is meant to render table cells, not ${element?.type}`
    );
  }

  const formulaResult = useTableColumnFormulaResultForCell(element);

  // series
  const cellType = useCellType(element);

  const isColumnSelected = useIsColumnSelected(element);
  const isSeriesColumn = useMemo(() => cellType?.kind === 'series', [cellType]);
  const editable = useMemo(() => {
    const path = findNodePath(editor, element);
    if (path && path[path.length - 2] !== 2 && isSeriesColumn) {
      // first data row
      return false;
    }
    return true;
  }, [editor, element, isSeriesColumn]);

  const disabled = useMemo(() => {
    const path = findNodePath(editor, element);
    return (
      isSeriesColumn && path && path[path.length - 2] !== 2 && isColumnSelected
    );
  }, [editor, element, isColumnSelected, isSeriesColumn]);

  const computer = useComputer();
  // Displaying the unit on an empty cell creates a visual glitch
  const nodeText = getNodeString(element);
  const nodeTrimmedText = nodeText.trim();
  const hasText = nodeTrimmedText.length > 0;
  const isSoleNumber = !Number.isNaN(Number(nodeText));
  const unit =
    cellType?.kind === 'number' &&
    cellType.unit?.length &&
    hasText &&
    isSoleNumber
      ? computer.formatUnit(cellType.unit)
      : undefined;

  // Cell parse error (present for all cells, but only displayed in the series cell)
  const parseError = computer.getBlockIdResult$.useWithSelector(
    (elm) => (hasText ? elm?.error : undefined),
    element.id
  );
  const parseErrorMessage =
    typeof parseError === 'string' ? parseError : parseError?.message;

  const showParseError = useDelayedTrue(Boolean(parseError));

  const onChangeValue = useCallback(
    (newValue: string | undefined) => {
      const path = findNodePath(editor, element);
      if (path && newValue) {
        insertText(editor, newValue, { at: path });
      }
    },
    [editor, element]
  );

  // When I start editing and the cell type is anything, align right until I unfocus.
  const [forceAlignRight, setForceAlignRight] = useState(false);
  useEffect(() => {
    if (isColumnSelected && cellType?.kind === 'anything') {
      setForceAlignRight(true);
    }

    if (!isColumnSelected && forceAlignRight) {
      setForceAlignRight(false);
    }
  }, [cellType?.kind, isColumnSelected, forceAlignRight]);

  const dropdownResult = computer.getVarResult$.use(nodeText)?.result;
  const dropdownOptions = useMemo(() => {
    if (!cellType || cellType.kind !== 'dropdown') return [];

    const dropdown = editor.children.find((child) => child.id === cellType.id);
    if (!dropdown) {
      return [];
    }
    assertElementType(dropdown, ELEMENT_VARIABLE_DEF);
    if (dropdown.variant !== 'dropdown') return [];
    const { options } = dropdown.children[1];

    return options.map((o) => ({
      ...o,
      focused: nodeText === getExprRef(o.id),
    }));
  }, [cellType, editor.children, nodeText]);

  if (formulaResult != null) {
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
      alignRight={forceAlignRight || isCellAlignRight(cellType)}
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
