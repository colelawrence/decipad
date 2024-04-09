import { useTableColumnFormulaResultForCell } from '@decipad/editor-hooks';
import { CodeResult, table as tableStyles } from '@decipad/ui';
import type { SerializedType } from '@decipad/language';
import type { CellProps } from './types';
import { css } from '@emotion/react';

// These result types should be flush with the parent cell
const NO_PADDING_RESULT_KINDS = ['table', 'column', 'row'];

const noPaddingStyles = css({
  marginTop: -tableStyles.tdVerticalPadding,
  marginBottom: -tableStyles.tdVerticalPadding,
  /**
   * --td-no-padding-left sets marginLeft to 0 when inside a table cell with a
   * placeholder. This prevents the cell content from overlapping with the
   * placeholder.
   */
  marginLeft: `var(--td-no-padding-left, -${tableStyles.tdHorizontalPadding}px)`,
  marginRight: -tableStyles.tdHorizontalPadding,
});

export const CellEditorFormula = ({ element }: CellProps) => {
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
