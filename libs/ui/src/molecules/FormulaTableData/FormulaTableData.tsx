import { ComponentProps, FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import { p14Medium } from '../../primitives';
import { TableFormulaCell } from '../../atoms';

const tdLineStyles = css(p14Medium, {
  marginLeft: '12px',
});

const noEditingStyles = css({ display: 'none' });

export type FormulaTableDataProps = ComponentProps<typeof TableFormulaCell> & {
  result?: ReactNode;
};

export const FormulaTableData = ({
  children,
  result,
  ...props
}: FormulaTableDataProps): ReturnType<FC> => {
  // IMPORTANT NOTE: do not remove the children elements from rendering.
  // Even though they're one element with an empty text property, their absence triggers
  // an uncaught exception in slate-react.
  // Also, be careful with the element structure:
  // https://github.com/ianstormtaylor/slate/issues/3930#issuecomment-723288696
  return (
    <TableFormulaCell {...props}>
      <span css={noEditingStyles}>{children}</span>
      <span css={tdLineStyles} contentEditable={false}>
        {result}
      </span>
    </TableFormulaCell>
  );
};
