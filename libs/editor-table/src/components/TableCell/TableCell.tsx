/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ELEMENT_TD,
  ELEMENT_TH,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { atoms, molecules, organisms } from '@decipad/ui';
import { useAtom } from 'jotai';
import { isEnabled } from '@decipad/feature-flags';
import { useFormulaResult } from './useFormulaResult';
import { useIsCellSelected } from './useIsCellSelected';
import { dropLineAtom, trScope } from '../../contexts/tableAtoms';
import { useColumnDropDirection, useDropColumn } from '../../hooks';

export const TableCell: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  const editor = useTEditorRef();
  const selected = useIsCellSelected(element!);

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
      isEditable
      as="td"
      attributes={attributes}
      dropTarget={dropTarget}
    >
      {dropLine === 'top' && <atoms.RowDropLine dropLine={dropLine} />}
      {direction === 'left' && (
        <atoms.ColumnDropLine dropDirection={direction} />
      )}
      {children}
      {isEnabled('TABLE_CELL_SELECTION') && (
        <atoms.TableCellBackground selected={selected} />
      )}
      {direction === 'right' && (
        <atoms.ColumnDropLine dropDirection={direction} />
      )}
      {dropLine === 'bottom' && <atoms.RowDropLine dropLine={dropLine} />}
    </atoms.TableData>
  );
};
