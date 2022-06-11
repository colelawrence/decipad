import { ELEMENT_TD, ELEMENT_TH, PlateComponent } from '@decipad/editor-types';
import { atoms, molecules, organisms } from '@decipad/ui';
import { useAtom } from 'jotai';
import { isEnabled } from '@decipad/feature-flags';
import { useFormulaResult } from './useFormulaResult';
import { useIsCellSelected } from './useIsCellSelected';
import { dropLineAtom, trScope } from '../../contexts/tableAtoms';

export const TableCell: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const selected = useIsCellSelected(element!);

  const [dropLine] = useAtom(dropLineAtom, trScope);

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
    <atoms.TableData as="td" attributes={attributes} isEditable>
      {dropLine === 'top' && <atoms.RowDropLine dropLine={dropLine} />}
      {children}
      {isEnabled('TABLE_CELL_SELECTION') && (
        <atoms.TableCellBackground selected={selected} />
      )}
      {dropLine === 'bottom' && <atoms.RowDropLine dropLine={dropLine} />}
    </atoms.TableData>
  );
};
