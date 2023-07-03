/* eslint decipad/css-prop-named-variable: 0 */
import { useDelayedValue } from '@decipad/react-utils';
import { css } from '@emotion/react';
import { ComponentProps, FC, ReactNode } from 'react';
import { TableFormulaCell } from '../../atoms';
import { cssVar, p14Medium } from '../../primitives';
import { innerTablesNoTopBorderStyles } from '../../styles/table';

const tdLineStyles = css(p14Medium, {
  padding: '0 13px',
});

const selectedStyles = css({
  backgroundColor: cssVar('selectionColor'),
});

const noEditingStyles = css({ display: 'none' });

export type FormulaTableDataProps = ComponentProps<typeof TableFormulaCell> & {
  result?: ReactNode;
  resultType?: string;
  selected?: boolean;
  firstChildren?: ReactNode;
  dropDirection?: 'left' | 'right';
};

export const FormulaTableData = ({
  children,
  selected,
  result,
  resultType,
  firstChildren,
  ...props
}: FormulaTableDataProps): ReturnType<FC> => {
  const isError = resultType === 'nothing' || resultType === 'type-error';
  const delayedResult = useDelayedValue(
    <span
      css={css(
        resultType !== 'table' && resultType !== 'column' && tdLineStyles,
        resultType === 'column' && {
          backgroundColor: 'transparent',
        }
      )}
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
    <TableFormulaCell
      className={`formula-cell:${resultType}`}
      selected={selected}
      {...props}
      css={css(
        selected && selectedStyles,
        resultType === 'column' && {
          padding: 0,
          table: {
            height: '100%',
            ...innerTablesNoTopBorderStyles,
          },
        }
      )}
    >
      {firstChildren}
      <span css={noEditingStyles} contentEditable={false}>
        {children}
      </span>
      {delayedResult}
    </TableFormulaCell>
  );
};
