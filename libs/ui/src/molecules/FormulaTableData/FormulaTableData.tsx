import { ComponentProps, FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import { useDelayedValue } from '@decipad/react-utils';
import { cssVar, p14Medium } from '../../primitives';
import { TableFormulaCell } from '../../atoms';

const tdLineStyles = css(p14Medium, {
  marginLeft: '12px',
});

const selectedStyles = css({
  backgroundColor: cssVar('tableSelectionBackgroundColor'),
});

const noEditingStyles = css({ display: 'none' });

export type FormulaTableDataProps = ComponentProps<typeof TableFormulaCell> & {
  result?: ReactNode;
  resultType?: string;
  selected?: boolean;
};

export const FormulaTableData = ({
  children,
  selected,
  result,
  resultType,
  ...props
}: FormulaTableDataProps): ReturnType<FC> => {
  const isError = resultType === 'nothing' || resultType === 'type-error';
  const delayedResult = useDelayedValue(
    <span
      css={resultType !== 'table' ? tdLineStyles : null}
      contentEditable={false}
    >
      {result}
    </span>,
    isError /* TODO && whether the formula is selected */
  );

  // IMPORTANT NOTE: do not remove the children elements from rendering.
  // Even though they're one element with an empty text property, their absence triggers
  // an uncaught exception in slate-react.
  // Also, be careful with the element structure:
  // https://github.com/ianstormtaylor/slate/issues/3930#issuecomment-723288696
  return (
    <TableFormulaCell {...props} css={[selected ? selectedStyles : null]}>
      <span css={noEditingStyles} contentEditable={false}>
        {children}
      </span>
      {delayedResult}
    </TableFormulaCell>
  );
};
