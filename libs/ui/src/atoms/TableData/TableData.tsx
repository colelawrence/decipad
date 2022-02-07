import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import {
  cssVar,
  grey600,
  p12Medium,
  p14Medium,
  setCssVar,
} from '../../primitives';
import { table } from '../../styles';
import { tableRowCounter } from '../../utils';

const lineNumberWidth = '22px';

const tdBaseStyles = css(p14Medium, {
  display: 'grid',
  overflowX: 'hidden',
  alignItems: 'center',

  background: cssVar('backgroundColor'),

  minHeight: table.tdMinHeight,
  verticalAlign: 'middle',

  '&:focus-within': {
    borderRadius: '6px',
    boxShadow: `0 0 0 1.5px ${grey600.rgb}`,
    zIndex: 1,
  },

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
  },
});

export interface TableDataProps {
  className?: string;
  children?: ReactNode;
}

export const TableData = ({
  className,
  children,
}: TableDataProps): ReturnType<FC> => {
  return (
    <td css={[tdBaseStyles]} className={className}>
      {children}
    </td>
  );
};
