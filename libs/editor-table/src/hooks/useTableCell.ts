import { Result } from '@decipad/computer';
import {
  CellValueType,
  TableCellElement,
  TableHeaderElement,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  useSelection,
  useTableColumnFormulaResultForCell,
} from '@decipad/editor-hooks';
import { useComputer } from '@decipad/react-contexts';
import { useDelayedTrue } from '@decipad/react-utils';
import {
  TElement,
  findNodePath,
  getNodeString,
  insertText,
  isCollapsed,
} from '@udecode/plate';
import { useCallback, useMemo } from 'react';
import { ConnectDropTarget } from 'react-dnd';
import { useSelected } from 'slate-react';
import {
  useCellType,
  useDropColumn,
  useIsCellSelected,
  useIsColumnSelected,
} from '.';
import { useTableStore } from '../contexts/tableStore';
import { DropdownOption } from '../types';
import { useDropdownConsumer } from './useDropdownConsumer';

interface UseTableCellResult {
  cellType: CellValueType | undefined;
  selected: boolean;
  focused: boolean;
  collapsed: boolean;
  editable: boolean;
  disabled: boolean;
  selectedCells: TElement[] | null;
  dropTarget: ConnectDropTarget;
  formulaResult: Result.Result | undefined;
  unit: string | undefined;
  parseErrorMessage: string | undefined;
  showParseError: boolean;
  onChangeValue: (newValue: string | undefined) => void;
  dropdownResult: Result.Result | undefined;
  dropdownOptions: DropdownOption[];
  nodeText: string;
}

const debounceParseErrorMs = 500;

export const useTableCell = (
  element: TableHeaderElement | TableCellElement
): UseTableCellResult => {
  const editor = useTEditorRef();
  const selected = useIsCellSelected(element!) ?? false;
  const focused = useSelected();
  const collapsed = isCollapsed(useSelection());
  const selectedCells = useTableStore().get.selectedCells();
  const [, dropTarget] = useDropColumn(editor, element!);

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
      (isSeriesColumn &&
        path &&
        path[path.length - 2] !== 2 &&
        isColumnSelected) ??
      false
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
      : cellType?.kind === 'constant'
      ? cellType.constant.name
      : undefined;

  // Cell parse error (present for all cells, but only displayed in the series cell)
  const parseError = computer.getBlockIdResult$.useWithSelectorDebounced(
    debounceParseErrorMs,
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

  const { dropdownOptions, dropdownResult } = useDropdownConsumer({
    varName: nodeText,
    cellType,
  });

  return useMemo(
    () => ({
      cellType,
      selected,
      focused,
      collapsed,
      editable,
      disabled,
      selectedCells,
      dropTarget,
      formulaResult,
      unit,
      parseErrorMessage,
      showParseError,
      onChangeValue,
      dropdownResult,
      dropdownOptions,
      nodeText,
    }),
    [
      cellType,
      collapsed,
      disabled,
      dropTarget,
      dropdownOptions,
      dropdownResult,
      editable,
      focused,
      formulaResult,
      onChangeValue,
      parseErrorMessage,
      selected,
      selectedCells,
      showParseError,
      unit,
      nodeText,
    ]
  );
};
