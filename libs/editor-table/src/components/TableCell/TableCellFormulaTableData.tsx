import { FC, ReactNode } from 'react';
import {
  ElementAttributes,
  LeafAttributes,
  TableCellElement,
  TableHeaderElement,
} from '@decipad/editor-types';
import { FormulaTableData, CodeResult } from '@decipad/ui';
import { useTableColumnFormulaResultForCell } from '@decipad/editor-hooks';
import { SerializedType } from '@decipad/computer';
import { sanitizeColumnDropDirection } from '../../utils';

export type TableCellFormulaTableDataProps = {
  selected?: boolean;
  dropDirection?: 'left' | 'right';
  element: TableCellElement | TableHeaderElement;
  attributes: ElementAttributes | LeafAttributes;
  children: ReactNode;
};

export const TableCellFormulaTableData = ({
  children,
  selected,
  dropDirection,
  element,
  attributes,
}: TableCellFormulaTableDataProps): ReturnType<FC> => {
  // Causes re-renders even when the result is the same
  const formulaResult = useTableColumnFormulaResultForCell(element);

  // IMPORTANT NOTE: do not remove the children elements from rendering.
  // Even though they're one element with an empty text property, their absence triggers
  // an uncaught exception in slate-react.
  // Also, be careful with the element structure:
  // https://github.com/ianstormtaylor/slate/issues/3930#issuecomment-723288696
  return (
    <FormulaTableData
      result={
        formulaResult && (
          <CodeResult
            parentType={{ kind: 'table' } as SerializedType}
            {...formulaResult}
            element={element}
          />
        )
      }
      resultType={formulaResult && formulaResult.type.kind}
      {...attributes}
      selected={selected}
      dropDirection={sanitizeColumnDropDirection(dropDirection)}
    >
      {children}
    </FormulaTableData>
  );
};
