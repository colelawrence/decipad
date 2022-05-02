import { PlateComponentAttributes } from '@decipad/editor-types';
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar, p12Medium, p14Medium, setCssVar } from '../../primitives';
import { table } from '../../styles';
import { tableRowCounter } from '../../utils';

const lineNumberWidth = '22px';

const tdBaseStyles = css(p14Medium, {
  display: 'grid',
  overflowX: 'hidden',
  alignItems: 'center',

  minHeight: table.tdMinHeight,
  verticalAlign: 'middle',

  // Show line numbers on the first cell of each row.
  position: 'relative',
  '&:first-of-type': {
    paddingLeft: lineNumberWidth,
  },
  '&:first-of-type::before': {
    ...setCssVar('normalTextColor', cssVar('weakTextColor')),
    ...p12Medium,
    backgroundColor: cssVar('backgroundColor'),

    counterIncrement: tableRowCounter,
    content: `counter(${tableRowCounter})`,

    position: 'absolute',
    right: `calc(100% - ${lineNumberWidth})`,
    top: '50%',
    transform: 'translateY(-50%)',
    fontVariantNumeric: 'tabular-nums',
  },
});

export interface TableDataProps {
  className?: string;
  children?: ReactNode;
  attributes?: PlateComponentAttributes;
}

export const TableFormulaCell = ({
  attributes,
  className,
  children,
}: TableDataProps): ReturnType<FC> => {
  // IMPORTANT NOTE: do not remove the children elements from rendering.
  // Even though they're one element with an empty text property, their absence triggers
  // an uncaught exception in slate-react.
  // Also, be careful with the element structure:
  // https://github.com/ianstormtaylor/slate/issues/3930#issuecomment-723288696
  return (
    <td {...attributes} css={[tdBaseStyles]} className={className}>
      {children}
    </td>
  );
};
