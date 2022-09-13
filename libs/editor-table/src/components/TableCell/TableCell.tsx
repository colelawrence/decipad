/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ELEMENT_TD,
  ELEMENT_TH,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { isElementOfType, useSelection } from '@decipad/editor-utils';
import {
  useComputer,
  useInteractiveElementParseError,
  useTableColumnFormulaResultForElement,
} from '@decipad/react-contexts';
import { atoms, molecules, organisms } from '@decipad/ui';
import {
  findNodePath,
  getNodeString,
  isCollapsed,
  selectedCellsAtom,
} from '@udecode/plate';
import { useAtom } from 'jotai';
import { useMemo } from 'react';
import { useSelected } from 'slate-react';
import { dropLineAtom, trScope } from '../../contexts/tableAtoms';
import {
  useCellType,
  useColumnDropDirection,
  useDropColumn,
  useIsCellSelected,
  useIsColumnSelected,
} from '../../hooks';
import { isCellAlignRight } from '../../utils/isCellAlignRight';
import { tableScope } from '../Table/Table';

export const TableCell: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  const editor = useTEditorRef();
  const [selectedCells] = useAtom(selectedCellsAtom, tableScope);
  const selected = useIsCellSelected(element!);
  const focused = useSelected();
  const collapsed = isCollapsed(useSelection());
  const [dropLine] = useAtom(dropLineAtom, trScope);

  const [, dropTarget] = useDropColumn(editor, element!);
  const direction = useColumnDropDirection(editor, element!);

  if (
    !isElementOfType(element, ELEMENT_TH) &&
    !isElementOfType(element, ELEMENT_TD)
  ) {
    throw new Error(
      `TableCell is meant to render table cells, not ${element?.type}`
    );
  }

  const formulaResult = useTableColumnFormulaResultForElement(element);

  // series
  const cellType = useCellType(element);
  const isColumnSelected = useIsColumnSelected(element);
  const isSeriesColumn = useMemo(
    () => cellType && cellType.kind === 'series',
    [cellType]
  );
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
  const nodeText = getNodeString(element).trim();
  const hasText = nodeText !== '';
  const isSoleNumber = !Number.isNaN(Number(nodeText));
  const unit =
    cellType?.kind === 'number' &&
    cellType.unit?.length &&
    hasText &&
    isSoleNumber
      ? computer.formatUnit(cellType.unit)
      : undefined;

  const parseError = useInteractiveElementParseError(element.id);

  if (formulaResult != null) {
    // IMPORTANT NOTE: do not remove the children elements from rendering.
    // Even though they're one element with an empty text property, their absence triggers
    // an uncaught exception in slate-react.
    // Also, be careful with the element structure:
    // https://github.com/ianstormtaylor/slate/issues/3930#issuecomment-723288696
    return (
      <molecules.FormulaTableData
        result={<organisms.CodeResult {...formulaResult} />}
        resultType={formulaResult.type.kind}
        {...attributes}
        selected={selected}
      >
        {children}
      </molecules.FormulaTableData>
    );
  }

  return (
    <atoms.TableData
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
      alignRight={isCellAlignRight(cellType)}
      parseError={parseError}
    >
      {dropLine === 'top' && <atoms.RowDropLine dropLine={dropLine} />}
      {direction === 'left' && (
        <atoms.ColumnDropLine dropDirection={direction} />
      )}
      {children}
      {direction === 'right' && (
        <atoms.ColumnDropLine dropDirection={direction} />
      )}
      {dropLine === 'bottom' && <atoms.RowDropLine dropLine={dropLine} />}
    </atoms.TableData>
  );
};
