/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useMemo } from 'react';
import {
  ELEMENT_TD,
  ELEMENT_TH,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { useSelection } from '@decipad/editor-utils';
import { atoms, molecules, organisms } from '@decipad/ui';
import { useAtom } from 'jotai';
import { isCollapsed, findNodePath } from '@udecode/plate';
import { dropLineAtom, trScope } from '../../contexts/tableAtoms';
import {
  useColumnDropDirection,
  useDropColumn,
  useFormulaResult,
  useIsCellSelected,
  useCellType,
  useIsColumnSelected,
} from '../../hooks';

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

  const type = element?.type;
  if (!element || (type !== ELEMENT_TH && type !== ELEMENT_TD)) {
    throw new Error(
      `TableCell is meant to render table cells, not ${element?.type}`
    );
  }

  const result = useFormulaResult(element);

  // series
  const cellType = useCellType(element);
  const isColumnSelected = useIsColumnSelected(element);
  const isSeriesColumn = useMemo(
    () => cellType && cellType.kind === 'series',
    [cellType]
  );
  const editableProps = useMemo(() => {
    const path = findNodePath(editor, element);
    if (path && path[path.length - 2] !== 2 && isSeriesColumn) {
      // first data row
      return { isEditable: false };
    }
    return { isEditable: true };
  }, [editor, element, isSeriesColumn]);

  const disabledProps = useMemo(() => {
    const path = findNodePath(editor, element);
    return isSeriesColumn &&
      path &&
      path[path.length - 2] !== 2 &&
      isColumnSelected
      ? { disabled: true }
      : { disabled: false };
  }, [editor, element, isColumnSelected, isSeriesColumn]);

  if (result != null) {
    // IMPORTANT NOTE: do not remove the children elements from rendering.
    // Even though they're one element with an empty text property, their absence triggers
    // an uncaught exception in slate-react.
    // Also, be careful with the element structure:
    // https://github.com/ianstormtaylor/slate/issues/3930#issuecomment-723288696
    return (
      <molecules.FormulaTableData
        result={<organisms.CodeResult {...result} />}
        {...attributes}
      >
        {children}
      </molecules.FormulaTableData>
    );
  }

  return (
    <atoms.TableData
      {...editableProps}
      {...disabledProps}
      isUserContent
      as="td"
      attributes={attributes}
      dropTarget={dropTarget}
      selected={selected}
      collapsed={collapsed}
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
