import { TableCellElement } from '@decipad/editor-types';
import { ReactNode, useMemo } from 'react';
import {
  useComputer,
  useTableColumnFormulaResultForElement,
} from '@decipad/react-contexts';
import { isCellAlignRight, useCellType } from '@decipad/editor-table';
import { getNodeString } from '@udecode/plate';
import { atoms, molecules, organisms } from '@decipad/ui';

export const DndCellPreview = ({
  element,
  colIndex,
  children,
}: {
  element: TableCellElement;
  colIndex: number;
  children: ReactNode;
}) => {
  const computer = useComputer();
  const formulaResult = useTableColumnFormulaResultForElement(element);

  const cellType = useCellType(element);
  const nodeText = getNodeString(element).trim();
  const hasText = nodeText !== '';
  const isSoleNumber = nodeText === Number(nodeText).toString();

  const unit = useMemo(
    () =>
      cellType?.kind === 'number' &&
      cellType.unit?.length &&
      hasText &&
      isSoleNumber
        ? computer.formatUnit(cellType.unit)
        : undefined,
    [cellType, computer, hasText, isSoleNumber]
  );

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
        hiddenCounter={colIndex !== 0}
      >
        {children}
      </molecules.FormulaTableData>
    );
  }

  return (
    <atoms.TableData
      showPlaceholder={colIndex === 0}
      isUserContent
      as="td"
      unit={unit}
      alignRight={isCellAlignRight(cellType)}
    >
      {children}
    </atoms.TableData>
  );
};
