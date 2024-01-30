/* eslint decipad/css-prop-named-variable: 0 */
import { useTableColumnFormulaResultForCell } from '@decipad/editor-hooks';
import { isElementOfType } from '@decipad/editor-utils';
import { ELEMENT_TD, ELEMENT_TH } from '@decipad/editor-types';
import { CodeResult } from '../CodeResult/CodeResult';
import { SerializedType } from '@decipad/language';
import type { CellProps } from './types';
import { tdHorizontalPadding, tdVerticalPadding } from '../../../styles/table';
import { css } from '@emotion/react';

// These result types should be flush with the parent cell
const NO_PADDING_RESULT_KINDS = ['table', 'column', 'row'];

const noPaddingStyles = css({
  marginTop: -tdVerticalPadding,
  marginBottom: -tdVerticalPadding,
  /**
   * --td-no-padding-left sets marginLeft to 0 when inside a table cell with a
   * placeholder. This prevents the cell content from overlapping with the
   * placeholder.
   */
  marginLeft: `var(--td-no-padding-left, -${tdHorizontalPadding}px)`,
  marginRight: -tdHorizontalPadding,
});

export const CellEditorFormula = ({ element }: CellProps) => {
  if (
    !isElementOfType(element, ELEMENT_TH) &&
    !isElementOfType(element, ELEMENT_TD)
  ) {
    throw new Error(
      `TableCellFormula is meant to render table cells, not ${element?.type}`
    );
  }

  // Causes re-renders even when the result is the same
  const formulaResult = useTableColumnFormulaResultForCell(element);
  if (!formulaResult || formulaResult.type.kind === 'type-error') return null;

  const noPadding = NO_PADDING_RESULT_KINDS.includes(formulaResult.type.kind);

  return (
    <div css={[noPadding && noPaddingStyles]}>
      <CodeResult
        parentType={{ kind: 'table' } as SerializedType}
        {...formulaResult}
        element={element}
      />
    </div>
  );
};
