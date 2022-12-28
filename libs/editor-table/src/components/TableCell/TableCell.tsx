/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
  PlateComponent,
  TableCellElement,
  TableRowElement,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  isElementOfType,
  useSelection,
  useTableColumnFormulaResultForCell,
} from '@decipad/editor-utils';
import { useComputer } from '@decipad/react-contexts';
import { useDelayedTrue } from '@decipad/react-utils';
import {
  CodeResult,
  ColumnDropLine,
  FormulaTableData,
  RowDropLine,
  TableData,
} from '@decipad/ui';
import {
  findNodePath,
  getNodeString,
  insertText,
  isCollapsed,
  useElement,
} from '@udecode/plate';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelected } from 'slate-react';
import { NewElementLine } from '@decipad/ui/src/atoms/NewElementLine/NewElementLine';
import {
  addRowFromCell,
  useCellType,
  useColumnDropDirection,
  useDropColumn,
  useIsCellSelected,
  useIsColumnSelected,
} from '../../hooks';
import { isCellAlignRight } from '../../utils/isCellAlignRight';
import { useTableRowStore, useTableStore } from '../../contexts/tableStore';

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
  const dropLine = useTableRowStore().get.dropLine();

  const [, dropTarget] = useDropColumn(editor, element!);
  const direction = useColumnDropDirection(editor, element!);
  const hoveredRowId = useTableStore().get.hoveredRowId();
  const setHoveredRowId = useTableStore().set.hoveredRowId();
  const hoveredRowBottomId = useTableStore().get.hoveredRowBottomId();
  const setHoveredRowBottomId = useTableStore().set.hoveredRowBottomId();
  const table = useElement(ELEMENT_TABLE);
  const row = useElement<TableRowElement>(ELEMENT_TR);

  const isRowHovered = hoveredRowId === row.id;
  const isLastRow = table.children[table.children.length - 1] === row;
  const isLastRowHovered = hoveredRowBottomId === row.id && isLastRow;

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

  const parseError = computer.getImperativeParseError$.useWithSelector(
    (elm) => elm?.error,
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

  const DropLine = (
    <>
      {!dropLine && (
        <NewElementLine
          onMouseEnter={() => setHoveredRowId(row.id)}
          onMouseLeave={() => setHoveredRowId(null)}
          onClick={() => setHoveredRowId(null)}
          onAdd={() =>
            addRowFromCell(editor, {
              cellElement: element as TableCellElement,
            })
          }
          show={isRowHovered}
          isTable
        />
      )}

      {!dropLine && isLastRow && (
        <NewElementLine
          onMouseEnter={() => {
            setHoveredRowBottomId(row.id);
          }}
          onMouseLeave={() => {
            setHoveredRowBottomId(null);
          }}
          onClick={() => setHoveredRowBottomId(null)}
          onAdd={() =>
            addRowFromCell(editor, {
              offset: 1,
              cellElement: element as TableCellElement,
            })
          }
          show={isLastRowHovered}
          isTable
          reverse
        />
      )}

      {dropLine === 'top' && <RowDropLine dropLine={dropLine} />}
      {direction === 'left' && <ColumnDropLine dropDirection={direction} />}
      {direction === 'right' && <ColumnDropLine dropDirection={direction} />}
      {dropLine === 'bottom' && <RowDropLine dropLine={dropLine} />}
    </>
  );

  if (formulaResult != null) {
    // IMPORTANT NOTE: do not remove the children elements from rendering.
    // Even though they're one element with an empty text property, their absence triggers
    // an uncaught exception in slate-react.
    // Also, be careful with the element structure:
    // https://github.com/ianstormtaylor/slate/issues/3930#issuecomment-723288696
    return (
      <FormulaTableData
        result={<CodeResult {...formulaResult} />}
        resultType={formulaResult.type.kind}
        {...attributes}
        selected={selected}
        firstChildren={DropLine}
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
      firstChildren={DropLine}
    >
      {children}
    </TableData>
  );
};
