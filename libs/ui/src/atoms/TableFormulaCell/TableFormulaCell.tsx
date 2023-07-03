/* eslint decipad/css-prop-named-variable: 0 */
import { PlateComponentAttributes } from '@decipad/editor-types';
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar, p12Medium, p14Medium, setCssVar } from '../../primitives';
import { table } from '../../styles';
import { tdBaseStyles } from '../../styles/table';
import { tableRowCounter } from '../../utils';
import { ColumnDropLine } from '../DropLine/ColumnDropLine';

const lineNumberWidth = '22px';

const functionTdBaseStyles = css(p14Medium, {
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: cssVar('tintedBackgroundColor'),
  height: table.tdMinHeight,
  verticalAlign: 'middle',
  cursor: 'default',
  caretColor: 'transparent',

  // Show line numbers on the first cell of each row.
  position: 'relative',
});

const tdCounterStyles = css({
  '&:first-of-type': {
    paddingLeft: table.firstTdPaddingLeft,
  },
  '&:first-of-type::before': {
    ...setCssVar('normalTextColor', cssVar('weakTextColor')),
    ...p12Medium,
    backgroundColor: 'transparent',

    counterIncrement: tableRowCounter,
    content: `counter(${tableRowCounter})`,

    position: 'absolute',
    right: `calc(100% - ${lineNumberWidth})`,
    top: '50%',
    transform: 'translateY(-50%)',
    fontVariantNumeric: 'tabular-nums',
  },
});

const selectedStyles = css({
  backgroundColor: cssVar('tableSelectionBackgroundColor'),
});

export interface TableFormulaCellProps {
  className?: string;
  children?: ReactNode;
  attributes?: PlateComponentAttributes;
  dropDirection?: 'left' | 'right';
  hiddenCounter?: boolean;
  selected?: boolean;
}

export const TableFormulaCell = ({
  attributes,
  className,
  children,
  dropDirection,
  hiddenCounter,
  selected,
}: TableFormulaCellProps): ReturnType<FC> => {
  // IMPORTANT NOTE: do not remove the children elements from rendering.
  // Even though they're one element with an empty text property, their absence triggers
  // an uncaught exception in slate-react.
  // Also, be careful with the element structure:
  // https://github.com/ianstormtaylor/slate/issues/3930#issuecomment-723288696
  return (
    <td
      {...attributes}
      css={css(
        tdBaseStyles,
        { padding: 0 },
        functionTdBaseStyles,
        !hiddenCounter && tdCounterStyles,
        selected && selectedStyles
      )}
      className={className}
    >
      {dropDirection === 'left' && (
        <ColumnDropLine
          dropDirection={dropDirection}
          leftStyles={css({ left: -1 })}
        />
      )}
      {children}
      {dropDirection === 'right' && (
        <ColumnDropLine dropDirection={dropDirection} />
      )}
    </td>
  );
};
