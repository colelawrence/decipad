import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar, grey400, p12Medium, setCssVar } from '../../primitives';
import { tableRowCounter } from '../../utils';

const tdStyles = css({
  padding: '0 12px',
  verticalAlign: 'middle',

  '&:focus-within': {
    borderRadius: '6px',
    boxShadow: `0 0 0 1.5px ${grey400.rgb}`,
  },

  // Show line numbers on the first cell of each row.
  position: 'relative',
  '&:first-of-type': {
    paddingLeft: '34px',
  },
  '&:first-of-type::before': {
    ...setCssVar('normalTextColor', cssVar('weakTextColor')),
    ...p12Medium,
    backgroundColor: cssVar('backgroundColor'),

    counterIncrement: tableRowCounter,
    content: `counter(${tableRowCounter})`,

    position: 'absolute',
    right: 'calc(100% - 22px)',
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
    <td css={tdStyles} className={className}>
      {children}
    </td>
  );
};
