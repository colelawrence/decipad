/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useMemo } from 'react';
import {
  ELEMENT_TD,
  ELEMENT_TH,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { isElementOfType, useSelection } from '@decipad/editor-utils';
import { atoms, molecules, organisms } from '@decipad/ui';
import { useAtom } from 'jotai';
import { findNodePath, isCollapsed } from '@udecode/plate';
import { useTableColumnFormulaResultForElement } from '@decipad/react-contexts';
import { dropLineAtom, trScope } from '../../contexts/tableAtoms';
import {
  useCellType,
  useColumnDropDirection,
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
      collapsed={collapsed}
      alignRight={isCellAlignRight(cellType)}
    >
      {dropLine === 'top' && <atoms.RowDropLine dropLine={dropLine} />}
      {direction === 'left' && (
        <atoms.ColumnDropLine dropDirection={direction} />
      )}
      {children}
      {<atoms.TableCellBackground selected={selected} />}
      {direction === 'right' && (
        <atoms.ColumnDropLine dropDirection={direction} />
      )}
      {dropLine === 'bottom' && <atoms.RowDropLine dropLine={dropLine} />}
    </atoms.TableData>
  );
};
